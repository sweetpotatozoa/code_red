const express = require('express')
const jwt = require('jsonwebtoken')

const AdminSurveyRouter = require('./Admin_Survey_Route') //설문조사 관리 라우터
const AppliedSurveyRouter = require('./Applied_Survey_Route') //설문조사 응답 라우터
const AuthRouter = require('./Auth_Route') //로그인, 회원가입 라우터

const router = express.Router()

router.use('/adminSurvey', AdminSurveyRouter)
router.use('/appliedSurvey', AppliedSurveyRouter)

module.exports = router
