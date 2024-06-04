const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  question: { type: String, required: true },
  response: { type: String, default: '' },
  rating: { type: Number, required: true },
})

module.exports = mongoose.model('Survey', surveySchema)
