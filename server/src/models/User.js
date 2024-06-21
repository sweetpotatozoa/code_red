const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userName: { type: String, required: true, unique: true }, // 사용자 이름, 필수 및 고유 값
  password: { type: String, required: true }, // 해시된 비밀번호, 필수
  realName: { type: String, required: true }, // 실명, 필수
  company: { type: String, required: true }, // 회사 이름, 필수
  phoneNumber: { type: String, required: true }, // 전화번호, 필수
  role: { type: String, required: true }, // 역할, 필수
  purpose: { type: String, required: true }, // 목적, 필수
  createAt: { type: String, required: true }, // 생성 일자, 필수
  surveyPosition: { type: Number, required: true }, // 설문조사 위치, 필수
})

module.exports = mongoose.model('User', userSchema)
