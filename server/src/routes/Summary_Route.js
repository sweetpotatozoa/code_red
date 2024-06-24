const express = require('express')
const SummaryController = require('../controllers/Summary_Controller')

const router = express.Router()

router.get('/:surveyId', SummaryController.getSurveySummary)
router.get('/:surveyId/questions', SummaryController.getSurveyQuestions)

module.exports = router
