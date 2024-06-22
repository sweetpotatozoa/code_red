const SummaryRepo = require('../repositories/Summary_Repo')
const { ObjectId } = require('mongodb')

class SummaryService {
  async getSurveySummary(surveyId) {
    const objectId = new ObjectId(surveyId)
    return await SummaryRepo.getSurveySummary(objectId)
  }
}

module.exports = new SummaryService()
