const AppliedSurveyService = require('../services/Applied_Survey_Service')

class AppliedSurveyController {
  static async getAllSurveys(req, res) {
    try {
      const { userId, isDeploy } = req.query
      const surveys = await AppliedSurveyService.getAllSurveys(userId, isDeploy)
      res.status(200).json({ status: 200, data: surveys })
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }

  static async addResponse(req, res) {
    try {
      const responseData = req.body
      const newResponse = await AppliedSurveyService.addResponse(responseData)
      res.status(201).json({ status: 201, data: newResponse })
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }

  static async updateResponse(req, res) {
    try {
      const responseId = req.params.id
      const responseData = req.body
      const updatedResponse = await AppliedSurveyService.updateResponse(
        responseId,
        responseData,
      )
      res.status(200).json({ status: 200, data: updatedResponse })
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }

  static async incrementViews(req, res) {
    try {
      const { surveyId } = req.params
      const result = await AppliedSurveyService.incrementViews(surveyId)
      res
        .status(200)
        .json({
          status: 200,
          message: 'Views incremented successfully',
          data: result,
        })
    } catch (error) {
      res.status(500).json({ status: 500, message: error.message })
    }
  }
}

module.exports = AppliedSurveyController
