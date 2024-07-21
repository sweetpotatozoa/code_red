const UsersRepo = require('../repositories/Users_Repo')
const SurveysRepo = require('../repositories/Surveys_Repo')
const templatesRepo = require('../repositories/Templates_Repo')
const ResponsesRepo = require('../repositories/Responses_Repo')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const { Parser } = require('json2csv')

class AdminSurveyService {
  //헬퍼 함수

  //유저 아이디 존재 검사
  async checkUserIdExist(userId) {
    const doesUserIdExist = await UsersRepo.checkUserIdExist(userId)
    if (!doesUserIdExist) {
      throw new Error('No user found')
    }
  }

  //설문조사 아이디 존재 검사
  async checkSurveyIdExist(surveyId) {
    const doesSurveyIdExist = await SurveysRepo.checkSurveyIdExist(surveyId)
    if (!doesSurveyIdExist) {
      throw new Error('No survey found')
    }
  }

  //설문조사 소유권 검사
  async checkSurveyOwnership(userId, surveyId) {
    const isSurveyOwner = await SurveysRepo.checkSurveyOwnership(
      userId,
      surveyId,
    )
    if (!isSurveyOwner) {
      throw new Error('You are not the owner of this survey')
    }
  }

  //날짜 형식 변환
  formatDate(date) {
    const d = new Date(date)
    const pad = (n) => (n < 10 ? '0' + n : n)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }

  //실제 함수

  // 설문조사 목록 가져오기
  async getSurveys(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    const surveys = await SurveysRepo.getSurveys(userId)
    if (surveys.length === 0) {
      throw new Error('No survey found')
    }
    return surveys.map((survey) => ({
      ...survey,
      updateAt: this.formatDate(survey.updateAt),
    }))
  }

  // 설문조사 배포 상태 변경
  async toggleDeploy(userId, surveyId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    await this.checkSurveyIdExist(surveyId) // 설문조사 존재 검사
    await this.checkSurveyOwnership(userId, surveyId) // 설문조사 소유권 검사
    return SurveysRepo.toggleDeploy(surveyId)
  }

  // 설문조사 삭제
  async deleteSurvey(userId, surveyId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    await this.checkSurveyIdExist(surveyId) // 설문조사 유효성 검사
    await this.checkSurveyOwnership(userId, surveyId) // 설문조사 소유권 검사
    return SurveysRepo.deleteSurvey(surveyId)
  }

  // 유저정보 가져오기
  async getUserInfo(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    const userInfo = await UsersRepo.getUserInfo(userId)
    return {
      realName: userInfo.realName || '익명의 유저',
      surveyPosition: userInfo.surveyPosition || 4,
      isConnect: userInfo.isConnect || false,
      isOnboarding: userInfo.isOnboarding || false,
    }
  }

  // 설문조사 뜨는 위치 변경
  async updateSurveyPosition(userId, surveyPosition) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사

    const surveyPositionInt = parseInt(surveyPosition)

    // surveyPosition 범위 검증
    const validPositions = [1, 2, 3, 4]
    if (!validPositions.includes(surveyPositionInt)) {
      throw new Error('Invalid survey position')
    }

    return await UsersRepo.updateSurveyPosition(userId, surveyPositionInt)
  }

  // 설문조사 템플릿 가져오기
  async getTemplates(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    return templatesRepo.getTemplates()
  }

  //설문조사 응답 요약 가져오기
  async getSurveySummary(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    const survey = await SurveysRepo.getSurveyViews(surveyId)
    const responses = await ResponsesRepo.getSurveyResponses(surveyId)

    const startCount = responses.length
    const completedResponses = responses.filter((r) => r.isComplete)
    const completedCount = completedResponses.length
    const dropoutCount = startCount - completedCount

    let avgResponseTime = 0
    if (completedResponses.length > 0) {
      const totalTime = completedResponses.reduce((sum, r) => {
        const createAt = new Date(r.createAt)
        const completeAt = new Date(r.completeAt)
        const timeDifference = completeAt - createAt
        return sum + (timeDifference > 0 ? timeDifference : 0)
      }, 0)
      avgResponseTime = totalTime / completedResponses.length / 1000
    }

    const views = survey.views || 0

    return {
      views,
      startCount,
      completedCount,
      dropoutCount,
      avgResponseTime: avgResponseTime.toFixed(2),
      exposureStartRatio:
        views > 0 ? ((startCount / views) * 100).toFixed(2) : '0.00',
      exposureCompletedRatio:
        views > 0 ? ((completedCount / views) * 100).toFixed(2) : '0.00',
      exposureDropoutRatio:
        views > 0 ? ((dropoutCount / views) * 100).toFixed(2) : '0.00',
    }
  }

  //설문조사 질문별 요약 가져오기
  async getSurveyQuestions(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    const survey = await SurveysRepo.getSurveyViews(surveyId)
    const responses = await ResponsesRepo.getSurveyResponses(surveyId)

    return survey.steps.map((step) => {
      const stepResponses = responses.flatMap((r) =>
        r.answers.filter((a) => a.stepId === step.id),
      )

      switch (step.type) {
        case 'welcome':
          return {
            ...step,
            views: survey.views || 0,
            responses: stepResponses.length,
          }
        case 'freeText':
          return {
            ...step,
            responses: stepResponses.length,
            contents: stepResponses.map((r) => r.answer),
          }
        case 'rating':
        case 'singleChoice':
        case 'multipleChoice':
          const optionCounts = step.options.reduce((acc, option) => {
            acc[option.id] = stepResponses.filter((r) => {
              if (step.type === 'multipleChoice') {
                return (
                  Array.isArray(r.answer) &&
                  r.answer.some((ans) => ans.id === option.id)
                )
              } else {
                return r.answer && r.answer.id === option.id
              }
            }).length
            return acc
          }, {})

          const result = {
            ...step,
            totalResponses: stepResponses.length,
            options: step.options.map((option) => ({
              ...option,
              eachResponses: optionCounts[option.id] || 0,
            })),
          }

          if (step.type === 'rating') {
            const totalScore = step.options.reduce(
              (sum, option, index) =>
                sum + (index + 1) * (optionCounts[option.id] || 0),
              0,
            )
            result.averageScore =
              result.totalResponses > 0
                ? (totalScore / result.totalResponses).toFixed(2)
                : 0
          }

          return result
        case 'info':
        case 'link':
          return {
            ...step,
            clicks: stepResponses.length,
          }
        default:
          return step
      }
    })
  }

  //설문조사 생성하기
  async createSurvey(templateId, userId) {
    // userId가 존재하는지 확인합니다.
    await this.checkUserIdExist(userId)

    // 유효한 templateId 목록을 정의합니다.
    const validId = ['1', '2', '3', '4', '5']
    // 주어진 templateId가 유효한지 확인합니다.
    if (!validId.includes(templateId)) {
      throw new Error('Invalid template id')
    }

    // templateId에 해당하는 템플릿을 데이터베이스에서 가져옵니다.
    const template = await templatesRepo.getTemplate(templateId)
    // 템플릿이 존재하지 않으면 에러를 발생시킵니다.
    if (!template) {
      throw new Error('Invalid template id')
    }

    // 기존 id와 새로운 UUID를 매핑할 객체를 생성합니다.
    const idMapping = {}

    const survey = {
      ...template, // 템플릿의 모든 속성을 복사합니다.
      userId: new mongoose.Types.ObjectId(userId), // userId를 설정합니다.
      createAt: new Date(), // 현재 날짜를 설정합니다.
      updateAt: new Date(), // 현재 날짜를 설정합니다.
      views: 0, // views를 0으로 설정합니다.
      steps: template.steps.map((step) => {
        const newStepId = uuidv4() // 새로운 UUID를 생성합니다.
        idMapping[step.id] = newStepId // 기존 id와 새 UUID를 매핑합니다.
        const newStep = {
          ...step,
          id: newStepId,
        }
        if (Array.isArray(step.options)) {
          newStep.options = step.options.map((option) => ({
            ...option,
            id: uuidv4(),
          }))
        }
        return newStep
      }),
    }

    // nextStepId 업데이트
    survey.steps = survey.steps.map((step) => {
      if (
        ['singleChoice', 'rating'].includes(step.type) &&
        Array.isArray(step.options)
      ) {
        return {
          ...step,
          options: step.options.map((option) => ({
            ...option,
            nextStepId: option.nextStepId ? idMapping[option.nextStepId] : null,
          })),
        }
      } else {
        const newStep = { ...step }
        if (step.nextStepId) {
          newStep.nextStepId = idMapping[step.nextStepId]
        }
        return newStep
      }
    })

    // 최상위 id 값을 삭제합니다 (템플릿의 id).
    delete survey.id

    // 새로 생성된 survey를 데이터베이스에 저장하고 반환합니다.
    return SurveysRepo.createSurvey(survey)
  }

  // 설문조사 개별 응답 가져오기
  async getResponses(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    const responses = await ResponsesRepo.getSurveyResponses(surveyId)

    if (responses.length === 0) {
      throw new Error('No responses found')
    }

    return responses
  }

  // 설문조사 응답 삭제
  async deleteResponse(userId, responseId) {
    await this.checkUserIdExist(userId)

    const response = await ResponsesRepo.getResponseById(responseId)
    if (!response) {
      throw new Error('No response found')
    }

    const surveyId = response.surveyId

    await SurveysRepo.decreaseView(surveyId)

    return ResponsesRepo.deleteResponse(responseId)
  }

  // 설문조사 isDeploy 값만 가져오기
  async getSurvey(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    return SurveysRepo.getSurveyDeployStatus(surveyId)
  }

  //연결상태 확인하기
  async checkConnect(userId) {
    await this.checkUserIdExist(userId)
    return SurveysRepo.checkConnect(userId)
  }

  //온보딩 완료 후 정보 저장하기
  async saveOnboardingInfo(userId, onboardingInfo) {
    await this.checkUserIdExist(userId)
    return UsersRepo.saveOnboardingInfo(userId, onboardingInfo)
  }

  // 수정할 설문조사 정보 가져오기
  async getSurveyForEdit(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    return SurveysRepo.getSurveyForEdit(surveyId)
  }

  // 설문조사 업데이트
  async updateSurvey(userId, surveyId, surveyData) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    surveyData.isDeploy = false

    return SurveysRepo.updateSurvey(surveyId, surveyData)
  }

  // 설문조사 업데이트하고 배포하기
  async updateSurveyAndDeploy(userId, surveyId, surveyData) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    surveyData.isDeploy = true
    return SurveysRepo.updateSurvey(surveyId, surveyData)
  }

  async getResponsesAsCSV(userId, surveyId) {
    await this.checkUserIdExist(userId)
    await this.checkSurveyIdExist(surveyId)
    await this.checkSurveyOwnership(userId, surveyId)

    const responses = await ResponsesRepo.getSurveyResponses(surveyId)

    if (responses.length === 0) {
      return null
    }

    const fields = this.getCSVFields(responses)
    const opts = { fields }
    const parser = new Parser(opts)

    const formattedResponses = this.formatResponsesForCSV(responses)
    let csvData = parser.parse(formattedResponses)

    // UTF-8 BOM 추가
    csvData = '\uFEFF' + csvData

    return csvData // CSV 데이터를 반환
  }

  getCSVFields(responses) {
    const baseFields = ['Response ID', 'Created At', 'Is Complete']
    const questionFields = this.getUniqueQuestions(responses)
    const allFields = [...baseFields, ...questionFields]
    return allFields
  }

  getUniqueQuestions(responses) {
    const questions = new Set()
    responses.forEach((response) => {
      response.answers.forEach((answer) => questions.add(answer.stepTitle))
    })
    const uniqueQuestions = Array.from(questions)
    return uniqueQuestions
  }

  formatResponsesForCSV(responses) {
    return responses.map((response) => {
      const baseInfo = {
        'Response ID': response._id.toString(),
        'Created At': this.formatDateCSV(response.createAt),
        'Is Complete': response.isComplete ? '제출완료' : '중도이탈',
      }

      const answers = {}
      response.answers.forEach((answer) => {
        answers[answer.stepTitle] = this.formatAnswer(answer.answer)
      })

      const formattedResponse = { ...baseInfo, ...answers }
      return formattedResponse
    })
  }

  formatDateCSV(date) {
    const d = new Date(date)
    const pad = (n) => (n < 10 ? '0' + n : n)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate(),
    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  formatAnswer(answer) {
    if (Array.isArray(answer)) {
      return answer.map((a) => this.formatSingleAnswer(a)).join(', ')
    } else {
      return this.formatSingleAnswer(answer)
    }
  }

  formatSingleAnswer(answer) {
    if (answer === null || answer === undefined) {
      return ''
    } else if (typeof answer === 'object') {
      return answer.value || answer.text || JSON.stringify(answer)
    } else {
      return String(answer)
    }
  }

  //온보딩 스킵하기
  async skipOnboarding(userId) {
    await this.checkUserIdExist(userId)
    return UsersRepo.skipOnboarding(userId)
  }
}

module.exports = new AdminSurveyService()
