const SummaryRepo = require('../repositories/Summary_Repo')

class SummaryService {
  async getSurveySummary(surveyId) {
    return await SummaryRepo.getSurveySummary(surveyId)
  }
}

module.exports = new SummaryService()
