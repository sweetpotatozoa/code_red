const AdminSurveyService = require('../services/Admin_Survey_Service')
const errorHandler = require('../utils/errorHandler')
const { isObjectId, isInteger, isString } = require('../utils/typeValid')

//추가적인 예외처리를 넣고 싶다면 아래와 같이 입력하세요.
// } catch (err) {
//   const { status, message } = errorHandler(err, 'anotherFunction', {
//     'Specific error message': (err) => ({ status: 400, message: 'something wrong' })
//   });
//   res.status(status).json({ message });
// }

class AdminSurveyController {
  // 유저 id로 설문조사 가져오기
  async getSurveys(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    try {
      const result = await AdminSurveyService.getSurveys(userId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getSurveys')
      res.status(status).json({ message })
    }
  }

  // 설문조사 배포 상태 변경
  async toggleDeploy(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    const surveyId = req.params.id // 각 설문조사 아이디

    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    if (!surveyId || !isObjectId(surveyId)) {
      res.status(400).json({ message: 'Invalid survey id' })
      return
    }

    try {
      const result = await AdminSurveyService.toggleDeploy(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'toggleDeploy')
      res.status(status).json({ message })
    }
  }

  // 설문조사 삭제
  async deleteSurvey(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    const surveyId = req.params.id // 각 설문조사 아이디

    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    if (!surveyId || !isObjectId(surveyId)) {
      res.status(400).json({ message: 'Invalid survey id' })
      return
    }
    try {
      const result = await AdminSurveyService.deleteSurvey(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'deleteSurvey')
      res.status(status).json({ message })
    }
  }

  //// 설문조사 isDeploy 상태만 가져오기
  async getSurvey(req, res) {
    try {
      const userId = req.user.id
      const { id: surveyId } = req.params

      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      if (!surveyId || !isObjectId(surveyId)) {
        return res.status(400).json({ message: 'Invalid survey id' })
      }

      const result = await AdminSurveyService.getSurvey(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getSurvey')
      res.status(status).json({ message })
    }
  }

  // 유저정보 가져오기
  async getUserInfo(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware

    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    try {
      const result = await AdminSurveyService.getUserInfo(userId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getUserInfo')
      res.status(status).json({ message })
    }
  }

  // 설문조사 뜨는 위치 변경
  async updateSurveyPosition(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    const surveyPosition = req.body.surveyPosition // surveyPosition 정보

    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }

    if (!surveyPosition || !isInteger(surveyPosition)) {
      res.status(400).json({ message: 'Invalid survey position' })
      return
    }
    try {
      const result = await AdminSurveyService.updateSurveyPosition(
        userId,
        surveyPosition,
      )
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'updateSurveyPosition', {
        'Invalid survey position': (err) => ({
          status: 400,
          message: 'Invalid survey position',
        }),
      })
      res.status(status).json({ message })
    }
  }

  // 설문조사 템플릿 가져오기
  async getTemplates(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    try {
      const result = await AdminSurveyService.getTemplates(userId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getTemplates')
      res.status(status).json({ message })
    }
  }

  // 설문조사 생성
  async createSurvey(req, res) {
    const userId = req.user.id // userId saved in jwt added by auth middleware
    const templateId = req.params.templateId // 템플릿 아이디

    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    if (!templateId || !isInteger(templateId)) {
      res.status(400).json({ message: 'Invalid template id ' })
      return
    }
    try {
      const result = await AdminSurveyService.createSurvey(templateId, userId)
      res.status(201).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'createSurvey')
      res.status(status).json({ message })
    }
  }

  // 설문조사 응답 요약 가져오기
  async getSurveySummary(req, res) {
    try {
      const userId = req.user.id
      const { surveyId } = req.params

      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      if (!surveyId || !isObjectId(surveyId)) {
        return res.status(400).json({ message: 'Invalid survey id' })
      }

      const result = await AdminSurveyService.getSurveySummary(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getSurveySummary')
      res.status(status).json({ message })
    }
  }

  // 설문조사 질문별 요약 가져오기
  async getSurveyQuestions(req, res) {
    try {
      const userId = req.user.id
      const { surveyId } = req.params

      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      if (!surveyId || !isObjectId(surveyId)) {
        return res.status(400).json({ message: 'Invalid survey id' })
      }

      const result = await AdminSurveyService.getSurveyQuestions(
        userId,
        surveyId,
      )
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getSurveyQuestions')
      res.status(status).json({ message })
    }
  }
  // 설문조사 개별 응답 가져오기
  async getResponses(req, res) {
    try {
      const userId = req.user.id
      const { id: surveyId } = req.params

      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      if (!surveyId || !isObjectId(surveyId)) {
        return res.status(400).json({ message: 'Invalid survey id' })
      }

      const result = await AdminSurveyService.getResponses(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getResponses')
      res.status(status).json({ message })
    }
  }

  // 설문조사 응답 삭제
  async deleteResponse(req, res) {
    try {
      const userId = req.user.id
      const { id: responseId } = req.params

      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      if (!responseId || !isObjectId(responseId)) {
        return res.status(400).json({ message: 'Invalid response id' })
      }

      const result = await AdminSurveyService.deleteResponse(userId, responseId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'deleteResponse')
      res.status(status).json({ message })
    }
  }

  //유저 아이디 반환
  async getUserId(req, res) {
    const userId = req.user.id
    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    try {
      res.status(200).json({ userId })
    } catch (err) {
      const { status, message } = errorHandler(err, 'getId')
    }
  }

  // 수정할 설문조사 정보 가져오기
  async getSurveyForEdit(req, res) {
    const userId = req.user.id
    const surveyId = req.params.id

    if (!userId || !isObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }
    if (!surveyId || !isObjectId(surveyId)) {
      return res.status(400).json({ message: 'Invalid survey id' })
    }

    try {
      const result = await AdminSurveyService.getSurveyForEdit(userId, surveyId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'getSurveyForEdit')
      res.status(status).json({ message })
    }
  }

  //연결상태 확인하기
  async checkConnect(req, res) {
    try {
      const userId = req.user.id
      if (!userId || !isObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user id' })
      }
      const result = await AdminSurveyService.checkConnect(userId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'checkConnection')
    }
  }

  // 설문조사 업데이트
  async updateSurvey(req, res) {
    const userId = req.user.id
    const surveyId = req.params.id
    const surveyData = req.body

    if (!userId || !isObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }
    if (!surveyId || !isObjectId(surveyId)) {
      return res.status(400).json({ message: 'Invalid survey id' })
    }

    try {
      const result = await AdminSurveyService.updateSurvey(
        userId,
        surveyId,
        surveyData,
      )
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'updateSurvey')
      res.status(status).json({ message })
    }
  }

  //온보딩 완료 후 정보 저장하기
  async saveOnboardingInfo(req, res) {
    const userId = req.user.id
    const onboardingInfo = req.body
    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    if (
      !onboardingInfo.role ||
      !isString(onboardingInfo.role) ||
      !onboardingInfo.purpose ||
      !isString(onboardingInfo.purpose) ||
      !onboardingInfo.isConnect ||
      !onboardingInfo.isOnboarding
    ) {
      res.status(400).json({ message: 'Invalid onboarding info' })
      return
    }
    try {
      const result = await AdminSurveyService.saveOnboardingInfo(
        userId,
        onboardingInfo,
      )
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'saveOnboardingInfo')
    }
  }

  // 설문조사 업데이트하고 배포하기
  async updateSurveyAndDeploy(req, res) {
    const userId = req.user.id
    const surveyId = req.params.id
    const surveyData = req.body

    if (!userId || !isObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user id' })
    }
    if (!surveyId || !isObjectId(surveyId)) {
      return res.status(400).json({ message: 'Invalid survey id' })
    }

    try {
      const result = await AdminSurveyService.updateSurveyAndDeploy(
        userId,
        surveyId,
        surveyData,
      )
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'updateSurveyAndDeploy')

      res.status(status).json({ message })
    }
  }

  async downloadResponses(req, res) {
    try {
      const userId = req.user.id
      const surveyId = req.params.id
      const csvData = await AdminSurveyService.getResponsesAsCSV(
        userId,
        surveyId,
      )

      if (!csvData) {
        return res.status(404).json({ message: 'No responses found' })
      }

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=survey_responses_${surveyId}.csv`,
      )
      res.send(csvData)
    } catch (err) {
      console.error('Error in downloadResponses:', err)
      res
        .status(500)
        .json({ message: 'Internal server error', error: err.message })
    }
  }

  // 온보딩 스킵하기
  async skipOnboarding(req, res) {
    const userId = req.user.id
    if (!userId || !isObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user id' })
      return
    }
    try {
      const result = await AdminSurveyService.skipOnboarding(userId)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'skipOnboarding')
      res.status(status).json({ message })
    }
  }
}

module.exports = new AdminSurveyController()
