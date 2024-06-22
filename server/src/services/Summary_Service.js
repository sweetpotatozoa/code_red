const SummaryRepo = require('../repositories/Summary_Repo')

class SummaryService {
  static async getSurveySummary(surveyId) {
    return await SummaryRepo.getSurveySummary(surveyId)
  }
}

module.exports = SummaryService
