const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  question: { type: String, required: true },
  rating: { type: Number }, // 별점 질문을 위한 필드
  options: { type: [String] }, // 객관식 질문을 위한 필드
  type: { type: String, required: true }, // 질문의 종류를 나타내는 필드
  multiChoiceResponse: { type: [String] }, // 다중 선택 객관식 질문을 위한 필드
})

module.exports = mongoose.model('Survey', surveySchema)
