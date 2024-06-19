const mongoose = require('mongoose')

// Option Schema
const OptionSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  value: { type: String, required: false }, // 필드가 존재하지 않아도 되며 빈문자열 가능
  nextStepId: { type: String, required: false }, // 필드가 반드시 존재해야 하며 빈문자열 가능
})

// Step Schema
const StepSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  title: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  description: { type: String, required: false }, // 필드가 반드시 존재해야 하지만 빈문자열 가능
  type: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  options: [OptionSchema],
})

// Trigger Schema
const TriggerSchema = new mongoose.Schema({
  id: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  title: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  description: { type: String, required: false }, // 필드가 반드시 존재해야 하지만 빈문자열 가능
  type: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가, 'newSession, scroll, exitIntent, click, url'
  clickType: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type !== 'click' || (v && v.trim() !== '')
      },
      message: 'clickType은 공백일 수 없습니다.',
    },
  }, // this.type이 click인 경우 필수이며, 빈문자열 불가
  clickValue: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type !== 'click' || (v && v.trim() !== '')
      },
      message: 'clickValue는 공백일 수 없습니다.',
    },
  }, // this.type이 click인 경우 필수이며, 빈문자열 불가
  pageType: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type === 'url' || (v && v.trim() !== '')
      },
      message: 'pageType은 공백일 수 없습니다.',
    },
  }, // this.type이 url이 아닌 경우 경우 필수이며, 빈문자열 불가
  pageValue: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type === 'url' || (v && v.trim() !== '')
      },
      message: 'pageValue는 공백일 수 없습니다.',
    },
  }, // this.type이 url이 아닌 경우 필수이며, 빈문자열 가능
})

// Main Survey Schema
const surveySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  question: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  isDeploy: { type: Boolean, default: false }, // 필드가 반드시 존재해야 하며, 빈문자열 불가
  steps: [StepSchema],
  triggers: [TriggerSchema],
  delay: {
    delayType: { type: String, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
    delayValue: { type: Number, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  },
  url: { type: String, required: false }, // 필드가 존재하지 않아도 되며 빈문자열 불가
})

module.exports = mongoose.model('Survey', surveySchema)
