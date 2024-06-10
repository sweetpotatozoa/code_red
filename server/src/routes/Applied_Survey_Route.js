const express = require('express')
const appliedSurveyRepo = require('../repositories/Applied_Survey_Repo')

const router = express.Router()

// 모든 설문조사 가져오기
router.get('/', async (req, res) => {
  const surveys = await appliedSurveyRepo.getAllSurveys()
  res.status(200).json(surveys)
})

// 새로운 설문조사 추가
router.post('/', async (req, res) => {
  const surveyData = req.body
  const newSurvey = await appliedSurveyRepo.addSurvey(surveyData)
  res.status(201).json({ status: 201, data: newSurvey })
})

// 설문조사 응답 추가
router.post('/response', async (req, res) => {
  const responseData = req.body
  const newResponse = await appliedSurveyRepo.addResponse(responseData)
  res.status(201).json({ status: 201, data: newResponse })
})

module.exports = router
