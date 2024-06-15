const mongoose = require('mongoose')

const stepSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  options: { type: [String] },
  isActived: { type: Boolean, default: true }
})

const triggerSchema = new mongoose.Schema({
  type: { type: String, required: true },
  url: { type: String },
  selector: { type: String },
  text: { type: String }
})

const surveySchema = new mongoose.Schema({
  customerId: { type: String, required: true },
  steps: { type: [stepSchema], required: true },
  triggers: { type: [triggerSchema], required: true },
  displayOption: { type: String, enum: ['once', 'untilCompleted', 'always'], required: true },
  cooldown: { type: Number },
  updateAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Survey', surveySchema)
