const express = require('express')
const AppliedSurveyController = require('../controllers/Applied_Survey_Controller')

const router = express.Router()

router.get('/', AppliedSurveyController.getAllSurveys)
router.post('/response', AppliedSurveyController.addResponse)
router.put('/response/:id', AppliedSurveyController.updateResponse)
router.post(
  '/:surveyId/increment-views',
  AppliedSurveyController.incrementViews,
)

module.exports = router
