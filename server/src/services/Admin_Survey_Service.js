const UsersRepo = require('../repositories/Users_Repo')
const SurveysRepo = require('../repositories/Surveys_Repo')
const templatesRepo = require('../repositories/Templates_Repo')
const ResponsesRepo = require('../repositories/Responses_Repo')
const { ObjectId } = require('mongodb')


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

  // ObjectId로 변환하는 헬퍼 함수 추가
  convertToObjectId(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid id format');
    }
    return new ObjectId(id);
  }

  //실제 함수

  // 설문조사 목록 가져오기
  async getSurveys(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    const surveys = await SurveysRepo.getSurveys(userId)
    if (surveys.length === 0) {
      throw new Error('No survey found')
    }
    return surveys
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
    }
  }

  // 설문조사 뜨는 위치 변경
  async updateSurveyPosition(userId, surveyPosition) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사

    // surveyPosition 범위 검증
    const validPositions = [1, 2, 3, 4]
    if (!validPositions.includes(surveyPosition)) {
      throw new Error('Invalid survey position')
    }

    return await UsersRepo.updateSurveyPosition(userId, surveyPosition)
  }

  // 설문조사 템플릿 가져오기
  async getTemplates(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    return templatesRepo.getTemplates()
  }

  //설문조사 응답 요약 가져오기
  async getSurveySummary(userId, surveyId) {
    const userObjectId = this.convertToObjectId(userId);
    const surveyObjectId = this.convertToObjectId(surveyId);

    await this.checkUserIdExist(userObjectId)
    await this.checkSurveyIdExist(surveyObjectId)
    await this.checkSurveyOwnership(userObjectId, surveyObjectId)
    
    const survey = await SurveysRepo.getSurveyViews(surveyObjectId)
    const responses = await ResponsesRepo.getSurveyResponses(surveyObjectId)

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
    const userObjectId = this.convertToObjectId(userId);
    const surveyObjectId = this.convertToObjectId(surveyId);

    await this.checkUserIdExist(userObjectId)
    await this.checkSurveyIdExist(surveyObjectId)
    await this.checkSurveyOwnership(userObjectId, surveyObjectId)
    
    const survey = await SurveysRepo.getSurveyById(surveyObjectId)
    const responses = await ResponsesRepo.getSurveyResponses(surveyObjectId)

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
            acc[option.id] = stepResponses.filter(
              (r) =>
                r.answer === option.id ||
                (Array.isArray(r.answer) && r.answer.includes(option.id)),
            ).length
            return acc
          }, {})
          return {
            ...step,
            totalResponses: stepResponses.length,
            options: step.options.map((option) => ({
              ...option,
              eachResponses: optionCounts[option.id] || 0,
            })),
          }
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
}

module.exports = new AdminSurveyService()