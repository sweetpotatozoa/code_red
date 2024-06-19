const mongoose = require('mongoose')

// Option Schema
const OptionSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  value: { type: String, required: false }, // 필드가 존재하지 않아도 되며 빈문자열 가능
  nextStepId: {
    type: String,
    required: function () {
      return this.type === 'singleChoice'
    }, // step.type이 singleChoice인 경우 필수이며, 빈문자열 불가
    trim: true,
  },
})

// Step Schema
const StepSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  title: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  description: { type: String, required: false }, // 필드가 존재하지 않아도 되며 빈문자열 가능
  type: {
    type: String,
    required: true,
    trim: true,
    enum: [
      'singleChoice',
      'multipleChoice',
      'rating',
      'link',
      'text',
      'info',
      'welcome',
      'thankyou',
    ],
  }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  options: [OptionSchema],
  buttonText: {
    type: String,
    required: function () {
      return this.type === 'link'
    },
    trim: true,
  }, // step.type이 link인 경우 필수이며, 빈문자열 불가
  url: {
    type: String,
    required: function () {
      return this.type === 'link'
    },
    trim: true,
  }, // step.type이 link인 경우 필수이며, 빈문자열 불가
  nextStepId: {
    type: String,
    required: function () {
      return this.type !== 'singleChoice' && this.type !== 'rating'
    }, // step.type이 singleChoice, rating을 제외한 나머지일 경우 반드시 존재해야 하며 빈문자열 가능
    trim: true,
  },
})

// Trigger Schema
const TriggerSchema = new mongoose.Schema({
  id: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  title: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  description: { type: String, required: false }, // 필드가 존재하지 않아도 되며 빈문자열 가능
  type: {
    type: String,
    required: true,
    trim: true,
    enum: ['newSession', 'scroll', 'exitIntent', 'click', 'url'],
  }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  clickType: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type !== 'click' || (v && v.trim() !== '')
      },
      message: 'clickType은 공백일 수 없습니다.',
    },
    required: function () {
      return this.type === 'click'
    }, // this.type이 click인 경우 필수이며, 빈문자열 불가
  },
  clickValue: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type !== 'click' || (v && v.trim() !== '')
      },
      message: 'clickValue는 공백일 수 없습니다.',
    },
    required: function () {
      return this.type === 'click'
    }, // this.type이 click인 경우 필수이며, 빈문자열 불가
  },
  pageType: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type === 'url' || (v && v.trim() !== '')
      },
      message: 'pageType은 공백일 수 없습니다.',
    },
    required: function () {
      return this.type !== 'url'
    }, // this.type이 url이 아닌 경우 필수이며, 빈문자열 불가
  },
  pageValue: {
    type: String,
    validate: {
      validator: function (v) {
        return this.type === 'url' || (v && v.trim() !== '')
      },
      message: 'pageValue는 공백일 수 없습니다.',
    },
    required: function () {
      return this.type !== 'url'
    }, // this.type이 url이 아닌 경우 필수이며, 빈문자열 불가
  },
})

// Main Survey Schema
const surveySchema = new mongoose.Schema({
  userId: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  isDeploy: { type: Boolean, default: false }, // 필드가 반드시 존재해야 하며, 빈문자열 불가
  steps: [StepSchema],
  triggers: [TriggerSchema],
  delay: {
    delayType: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
    delayValue: { type: Number, required: true }, // 필드가 반드시 존재해야 하며 빈문자열 불가
  },
  views: { type: Number, required: true }, // 필드가 반드시 존재해야 하며, 빈문자열 불가
  template: { type: String, required: false, trim: true }, // 필드가 존재하지 않아도 되며, 빈문자열 가능
  createAt: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며, 빈문자열 불가
  updateAt: { type: String, required: true, trim: true }, // 필드가 반드시 존재해야 하며, 빈문자열 불가
})

module.exports = mongoose.model('Survey', surveySchema)
