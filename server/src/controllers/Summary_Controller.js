const SummaryService = require('../services/Summary_Service')
const { ObjectId } = require('mongodb')

class SummaryController {
  async getSurveySummary(req, res) {
    try {
      const { surveyId } = req.params
      if (!ObjectId.isValid(surveyId)) {
        return res.status(400).json({ error: 'Invalid surveyId format' })
      }
      const summary = await SummaryService.getSurveySummary(surveyId)
      res.status(200).json(summary)
    } catch (error) {
      console.error('Error in getSurveySummary:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }

  async getSurveyQuestions(req, res) {
    try {
      const { surveyId } = req.params
      if (!ObjectId.isValid(surveyId)) {
        return res.status(400).json({ error: 'Invalid surveyId format' })
      }
      const questions = await SummaryService.getSurveyQuestions(surveyId)
      res.status(200).json(questions)
    } catch (error) {
      console.error('Error in getSurveyQuestions:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

module.exports = new SummaryController()
