const express = require('express')
const AppliedSurveyController = require('../controllers/Applied_Survey_Controller')

const router = express.Router()

router.get('/', (req, res) => AppliedSurveyController.getAllSurveys(req, res))
router.post('/response', (req, res) =>
  AppliedSurveyController.addResponse(req, res),
)
router.put('/response/:id', (req, res) =>
  AppliedSurveyController.updateResponse(req, res),
)
router.post('/:surveyId/increment-views', (req, res) =>
  AppliedSurveyController.incrementViews(req, res),
)

module.exports = router
