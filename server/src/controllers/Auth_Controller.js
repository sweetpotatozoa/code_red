const AuthService = require('../services/Auth_Service')
const errorHandler = require('../utils/errorHandler')
const {
  isObjectId,
  isInteger,
  isString,
  isValidUsernameOrPassword,
} = require('../utils/typeValid')

//추가적인 예외처리를 넣고 싶다면 아래와 같이 입력하세요.
// } catch (err) {
//   const { status, message } = errorHandler(err, 'anotherFunction', {
//     'Specific error message': (err) => ({ status: 400, message: 'something wrong' })
//   });
//   res.status(status).json({ message });
// }

class AuthController {
  // 회원가입
  async register(req, res) {
    const { userName, password, realName, phoneNumber } = req.body.input
    if (
      !isString(userName) ||
      !isString(password) ||
      !isString(realName) ||
      !isString(phoneNumber)
    ) {
      res.status(400).json({ message: 'Invalid input' })
      return
    }
    if (!isValidUsernameOrPassword(userName, password)) {
      res.status(400).json({
        message: '아이디와 비밀번호는 영문, 숫자혼합 8자 이상이어야 합니다.',
      })
      return
    }
    try {
      await AuthService.register(req.body.input)
      res.status(201).json({ message: '회원가입 성공' })
    } catch (err) {
      const { status, message } = errorHandler(err, 'register')
      res.status(status).json({ message })
    }
  }

  // 로그인
  async login(req, res) {
    const userInfo = req.body.input
    console.log(userInfo)
    if (!userInfo.userName || !userInfo.password) {
      res.status(400).json({ message: 'Invalid user name or password' })
      return
    }
    try {
      const result = await AuthService.login(userInfo)
      res.status(200).json(result)
    } catch (err) {
      const { status, message } = errorHandler(err, 'login')
      res.status(status).json({ message })
    }
  }
}

module.exports = new AuthController()
