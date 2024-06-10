const mongoose = require('mongoose')

const choiceSurveySchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  response: { type: String, default: '' },
})

module.exports = mongoose.model('ChoiceSurvey', choiceSurveySchema)
