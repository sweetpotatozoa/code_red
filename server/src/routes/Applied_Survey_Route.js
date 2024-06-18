const express = require('express')
const appliedSurveyRepo = require('../repositories/Applied_Survey_Repo')

const router = express.Router()

// 모든 설문조사 가져오기
router.get('/', async (req, res) => {
  const { customerId, isActive } = req.query
  let query = { customerId }

  // isActive 쿼리 파라미터가 존재할 경우 추가
  if (isActive !== undefined) {
    query.isActive = isActive === 'true'
  }

  try {
    const surveys = await appliedSurveyRepo.getSurveysByQuery(query)
    res.status(200).json({ status: 200, data: surveys })
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message })
  }
})

// 설문조사 응답 추가
router.post('/response', async (req, res) => {
  const responseData = req.body
  const newResponse = await appliedSurveyRepo.addResponse(responseData)
  res.status(201).json({ status: 201, data: newResponse })
})

// 설문조사 응답 업데이트
router.put('/response/:id', async (req, res) => {
  const responseId = req.params.id
  const responseData = req.body
  const updatedResponse = await appliedSurveyRepo.updateResponse(
    responseId,
    responseData,
  )
  res.status(200).json({ status: 200, data: updatedResponse })
})

module.exports = router
