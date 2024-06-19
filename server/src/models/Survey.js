const mongoose = require('mongoose')

const surveySchema = new mongoose.Schema({
  userId: { type: String, required: true }, // customerId -> userId 변경
  question: { type: String, required: true },
  response: { type: String, default: '' },
  rating: { type: Number }, // 별점 질문을 위한 필드
  options: { type: [String] }, // 객관식 질문을 위한 필드
  type: { type: String, required: true }, // 질문의 종류를 나타내는 필드
  isDeploy: { type: Boolean, default: false }, // isActive -> isDeploy 변경
  steps: [
    {
      id: { type: String, required: true }, // step에 id 추가
      title: String,
      description: String,
      type: String,
      options: [
        {
          id: { type: String, required: true }, // option에 id 추가
          value: String,
          nextStepId: String,
        },
      ],
    },
  ],
  triggers: [
    {
      id: { type: String, required: true }, // trigger에 id 추가
      title: String,
      description: String,
      type: String, // 기존 타입 값 (newSession, scroll, exitIntent, click, url)
      clickType: String, // click일 경우의 타입 (cssSelector 또는 innerText)
      clickValue: String, // selector 또는 text의 대체 필드
    },
  ],
  delay: {
    delayType: String, // 기존 displayOption
    delayValue: Number, // 기존 cooldown
  },
  url: String, // buttonUrl -> url 변경
})

module.exports = mongoose.model('Survey', surveySchema)
