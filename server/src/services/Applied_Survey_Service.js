const AppliedSurveyRepo = require('../repositories/Applied_Survey_Repo')
const { ObjectId } = require('mongodb')

class AppliedSurveyService {
  async getAllSurveys(userId, isDeploy) {
    let query = {}
    if (userId) {
      query.userId = new ObjectId(userId)
    }
    if (isDeploy !== undefined) {
      query.isDeploy = isDeploy === 'true'
    }
    return await AppliedSurveyRepo.getSurveysByQuery(query)
  }

  async addResponse(responseData) {
    if (responseData.userId) {
      responseData.userId = new ObjectId(responseData.userId)
    }
    if (responseData.surveyId) {
      responseData.surveyId = new ObjectId(responseData.surveyId)
    }
    return await AppliedSurveyRepo.addResponse(responseData)
  }

  async updateResponse(responseId, responseData) {
    const objectId = new ObjectId(responseId)
    return await AppliedSurveyRepo.updateResponse(objectId, responseData)
  }

  async incrementViews(surveyId) {
    const objectId = new ObjectId(surveyId)
    return await AppliedSurveyRepo.incrementViews(objectId)
  }
}

module.exports = new AppliedSurveyService()
