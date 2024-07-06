const UsersRepo = require('../repositories/Users_Repo')
const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const configs = require('../utils/configs')

class AuthService {
  //헬퍼 함수

  //유저 아이디 존재 검사
  async checkUserIdExist(userId) {
    const doesUserIdExist = await UsersRepo.checkUserIdExist(userId)
    if (!doesUserIdExist) {
      throw new Error('Invalid user name or password')
    }
  }

  //userName이 존재하는지 확인
  async checkUserNameExist(userName) {
    const doesUserNameExist = await UsersRepo.checkUserNameExist(userName)
    if (doesUserNameExist) {
      throw new Error('User name already exists')
    }
  }

  //유저 정보 가져오기
  async getUserInfo(userId) {
    const userInfo = await UsersRepo.getUserInfo(userId)
    if (!userInfo) {
      throw new Error('No user found')
    }
    return userInfo
  }

  //비밀번호 일치 검사
  async validatePassword(input, hash) {
    const isValid = bcrypt.compareSync(input, hash)
    if (!isValid) {
      throw new Error('Invalid user name or password')
    }
    return isValid
  }

  //토큰 부여
  async generateToken(userId) {
    const tokenPayload = { user: { id: userId } }
    const token = jwt.sign(tokenPayload, configs.accessTokenSecret)
    return token
  }

  //회원가입
  async register(userData) {
    const { userName, password, realName, phoneNumber, company } = userData
    await this.checkUserNameExist(userName)
    const hash = bcrypt.hashSync(password, 10)

    const newUser = {
      userName,
      password: hash,
      realName,
      phoneNumber,
      company,
      createAt: new Date(),
      surveyPosition: 4,
      isConnect: false,
      isOnboarding: false,
    }

    await UsersRepo.createUser(newUser)
    return { message: 'Sign up success' }
  }

  //로그인
  async login(userInfo) {
    const { userName, password } = userInfo
    const user = await UsersRepo.getUserByUserName(userName) //유저 정보 가져오기
    const isValid = await this.validatePassword(password, user.password) //비밀번호 일치 검사
    if (isValid) {
      const tokenResult = await this.generateToken(user._id) //토큰 부여
      return { token: tokenResult, isOnboarding: user.isOnboarding }
    } else {
      throw new Error('Invalid user name or password')
    }
  }
}

module.exports = new AuthService()
