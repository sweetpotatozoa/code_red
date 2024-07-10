const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const wrapAsync = require('../utils/wrapAsync')
const AuthController = require('../controllers/Auth_Controller')

// 회원가입
router.post('/register', wrapAsync(AuthController.register))

// 로그인
router.post('/login', wrapAsync(AuthController.login))

// 로그인 확인
router.get('/check', auth, wrapAsync(AuthController.checkAuth))

module.exports = router
