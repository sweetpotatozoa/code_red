const express = require('express')
const appliedSurveyRepo = require('../repositories/Applied_Survey_Repo')

const router = express.Router()

// 모든 설문조사 가져오기
router.get(
  '/',
  wrapAsync(async (req, res) => {
    const surveys = await appliedSurveyRepo.getAllSurveys()
    res.status(200).json(surveys)
  }),
)

// 새로운 설문조사 추가
router.post(
  '/',
  wrapAsync(async (req, res) => {
    const surveyData = req.body
    const newSurvey = await appliedSurveyRepo.addSurvey(surveyData)
    res.status(201).json({ status: 201, data: newSurvey })
  }),
)

function wrapAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      console.error('Error in route:', err)
      next(err)
    })
  }
}

module.exports = router
