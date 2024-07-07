const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')
const { ObjectId } = require('bson')

class UsersRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('users')
  }

  //헬퍼 함수

  //유저 아이디 유효성 검사
  async checkUserIdValidity(userId) {
    return ObjectId.isValid(userId)
  }

  // 유저 아이디 존재 검사
  async checkUserIdExist(userId) {
    const user = await this.collection.findOne({
      _id: new mongoose.Types.ObjectId(userId),
    })
    return user !== null
  }

  //userName 존재 검사
  async checkUserNameExist(userName) {
    const user = await this.collection.findOne({
      userName: userName,
    })
    return user !== null
  }

  //실제 함수

  // 유저 정보 가져오기
  async getUserInfo(userId) {
    const userInfo = await this.collection.findOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { projection: { realName: 1, surveyPosition: 1, isConnect: 1, _id: 1 } }, // 이름, 설문조사 위치, 연결상태 필드만 가져오기
    )
    return userInfo
  }

  // 설문조사 뜨는 위치 변경
  async updateSurveyPosition(userId, position) {
    const updatedStatus = await this.collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { surveyPosition: position } },
      { returnDocument: 'after', projection: { surveyPosition: 1, _id: 0 } }, // 변경된 surveyPosition 필드만 가져오기
    )
    return updatedStatus
  }

  // 유저 생성
  async createUser(newUser) {
    await this.collection.insertOne(newUser)
  }

  // 유저 정보 가져오기
  async getUserByUserName(userName) {
    const userPassword = await this.collection.findOne(
      { userName: userName },
      { projection: { password: 1, _id: 1, isOnboarding: 1 } },
    )
    return userPassword
  }

  //온보딩 완료 후 정보 저장하기
  async saveOnboardingInfo(userId, onboardingInfo) {
    await this.collection.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          isConnect: onboardingInfo.isConnect,
          isOnboarding: onboardingInfo.isOnboarding,
          purpose: onboardingInfo.purpose,
          role: onboardingInfo.role,
        },
      },
    )
    return true
  }
}

module.exports = new UsersRepo()
