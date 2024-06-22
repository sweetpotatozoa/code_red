const AppliedSurveyRepo = require('../repositories/Applied_Survey_Repo')

class AppliedSurveyService {
  async getAllSurveys(userId, isDeploy) {
    let query = { userId }
    if (isDeploy !== undefined) {
      query.isDeploy = isDeploy === 'true'
    }
    return await AppliedSurveyRepo.getSurveysByQuery(query)
  }

  async addResponse(responseData) {
    return await AppliedSurveyRepo.addResponse(responseData)
  }

  async updateResponse(responseId, responseData) {
    return await AppliedSurveyRepo.updateResponse(responseId, responseData)
  }

  async incrementViews(surveyId) {
    return await AppliedSurveyRepo.incrementViews(surveyId)
  }
}

module.exports = new AppliedSurveyService()
