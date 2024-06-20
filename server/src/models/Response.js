const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  stepId: { type: String, required: true, trim: true }, // 스텝 ID, 필수 및 공백 불가
  stepTitle: { type: String, required: true, trim: true }, // 스텝 제목, 필수 및 공백 불가
  stepDescription: { type: String, required: false, trim: true }, // 스텝 설명, 선택 및 공백 가능
  answer: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function (v) {
        return v !== null && v !== undefined
      },
      message: 'answer 필드는 존재해야 합니다.',
    },
  }, // 답변, 필수이지만 빈 문자열일 수 있음
})

const responseSchema = new mongoose.Schema({
  surveyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Survey',
    required: true,
  }, // 설문조사 ID, Survey 모델 참조
  answers: [answerSchema], // 답변 배열
  createdAt: { type: String, required: true, trim: true }, // 생성 일자, 필수 및 공백 불가
  completeAt: { type: String, required: false, trim: true }, // 완료 일자, 선택 및 공백 가능
  isComplete: { type: Boolean, required: true }, // 완료 여부, 필수
})

module.exports = mongoose.model('Response', responseSchema)
