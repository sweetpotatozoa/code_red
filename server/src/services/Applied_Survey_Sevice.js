const AppliedSurveyRepo = require('../repositories/Applied_Survey_Repo')

class AppliedSurveyService {
  static async getAllSurveys(userId, isDeploy) {
    let query = { userId }
    if (isDeploy !== undefined) {
      query.isDeploy = isDeploy === 'true'
    }
    return await AppliedSurveyRepo.getSurveysByQuery(query)
  }

  static async addResponse(responseData) {
    return await AppliedSurveyRepo.addResponse(responseData)
  }

  static async updateResponse(responseId, responseData) {
    return await AppliedSurveyRepo.updateResponse(responseId, responseData)
  }

  static async incrementViews(surveyId) {
    return await AppliedSurveyRepo.incrementViews(surveyId)
  }
}

module.exports = AppliedSurveyService
