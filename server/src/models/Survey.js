const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  type: { type: String, enum: ['rating', 'choice'], required: true },
  question: { type: String, required: true },
  options: [String], // 객관식 선택지
  response: { type: String, default: '' },
  rating: { type: Number },
})

module.exports = mongoose.model('Survey', surveySchema)
