const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  rating: { type: Number },
  options: { type: [String] },
  type: { type: String, required: true },
  multiChoiceResponse: { type: [String] },
  isActived: { type: Boolean, default: true },
})

module.exports = mongoose.model('Survey', surveySchema)
