const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  question: { type: String, required: true },
  response: { type: String, default: '' },
  rating: { type: Number }, // 별점 질문을 위한 필드
  options: { type: [String] }, // 객관식 질문을 위한 필드
  type: { type: String, required: true },
})

module.exports = mongoose.model('Survey', surveySchema)
