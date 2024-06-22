const SummaryService = require('../services/Summary_Service')

class SummaryController {
  async getSurveySummary(req, res) {
    try {
      const { surveyId } = req.params
      const summary = await SummaryService.getSurveySummary(surveyId)
      res.status(200).json(summary)
    } catch (error) {
      console.error('Error in getSurveySummary:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new SummaryController()
