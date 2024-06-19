const mongoose = require('mongoose')

// Option Schema
const OptionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 공백 불가
  value: String, // 공백 불가, rating의 경우 value가 없음
  nextStepId: { type: String, required: true }, // 공백 가능
})

// Step Schema
const StepSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 공백 불가
  title: { type: String, required: true }, // 공백 불가
  description: { type: String, required: true }, // 공백 가능
  type: { type: String, required: true }, // 공백 불가
  options: [OptionSchema],
})

// Trigger Schema
const TriggerSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 공백 불가
  title: { type: String, required: true }, // 공백 불가
  description: { type: String, required: true }, // 공백 가능
  type: { type: String, required: true }, // 공백 불가, 'newSession, scroll, exitIntent, click, url'
  clickType: String, // 공백 불가, 'cssSelector or innerText'
  clickValue: String, // 공백 불가, ' . # or text'
  pageType: String, // 공백 불가, trigger.type이 url일 경우 없음
  pageValue: String, // 공백 불가, trigger.type이 url일 경우 없음
})

// Main Survey Schema
const surveySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 공백 불가
  question: { type: String, required: true }, // 공백 불가
  rating: { type: Number }, // 공백 불가
  isDeploy: { type: Boolean, default: false }, // 공백 불가
  steps: [StepSchema],
  triggers: [TriggerSchema],
  delay: {
    delayType: { type: String, required: true }, // 공백 불가
    delayValue: { type: String, required: true }, // 공백 불가
  },
})

module.exports = mongoose.model('Survey', surveySchema)
