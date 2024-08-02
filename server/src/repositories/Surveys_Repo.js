const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')
const { ObjectId } = require('mongodb')

class SurveysRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('surveys')
  }

  //헬퍼 함수

  //설문조사 아이디 유효성 검사
  async checkSurveyIdValidity(surveyId) {
    return ObjectId.isValid(surveyId) //유효한 설문조사 아이디면 true 반환
  }

  //설문조사 아이디 존재 검사
  async checkSurveyIdExist(surveyId) {
    const survey = await this.collection.findOne({
      _id: new ObjectId(surveyId),
    })
    return survey !== null //유효한 설문조사라면 true 반환
  }

  // 설문조사 소유권 검사
  async checkSurveyOwnership(userId, surveyId) {
    const survey = await this.collection.findOne({
      _id: new ObjectId(surveyId),
      userId: new ObjectId(userId),
    })
    return survey !== null // 유저에게 설문조사의 소유권이 있다면 true 반환
  }

  //실제 함수

  // 설문조사 목록 가져오기
  async getSurveys(userId) {
    const surveys = await this.collection
      .find(
        { userId: new ObjectId(userId) },
        { projection: { _id: 1, title: 1, updateAt: 1, isDeploy: 1 } }, // 홈화면에서 필요한 필드만 가져오기
      )
      .sort({ updateAt: -1 }) // 수정 날짜 기준 내림차순 정렬
      .toArray()

    return surveys
  }

  // 설문조사 배포 상태 변경
  async toggleDeploy(surveyId) {
    const updatedStatus = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(surveyId) },
      [{ $set: { isDeploy: { $not: '$isDeploy' } } }],
      { returnDocument: 'after', projection: { isDeploy: 1, _id: 0 } },
    )
    return updatedStatus
  }

  // 설문조사 삭제
  async deleteSurvey(surveyId) {
    await this.collection.deleteOne({
      _id: new ObjectId(surveyId),
    })
  }

  // 설문조사 views 및 steps 가져오기
  async getSurveyViews(surveyId) {
    const survey = await this.collection.findOne(
      {
        _id: new ObjectId(surveyId),
      },
      { projection: { views: 1, steps: 1, _id: 0 } },
    )
    return survey
  }

  // 설문조사 생성
  async createSurvey(survey) {
    const result = await this.collection.insertOne(survey)
    return result.insertedId
  }

  // 설문조사 isDeploy 값만 가져오기
  async getSurveyDeployStatus(surveyId) {
    const survey = await this.collection.findOne(
      { _id: new ObjectId(surveyId) },
      { projection: { _id: 1, isDeploy: 1 } },
    )
    return survey
  }

  //연결상태 확인하기
  async checkConnect(userId) {
    const result = await this.collection.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      views: { $gte: 1 },
    })
    return result !== null
  }

  // 수정할 설문조사 정보 가져오기
  async getSurveyForEdit(surveyId) {
    const survey = await this.collection.findOne(
      { _id: new ObjectId(surveyId) },
      {
        projection: {
          _id: 1,
          title: 1,
          steps: 1,
          triggers: 1,
          delay: 1,
          isDeploy: 1,
        },
      },
    )
    return survey
  }

  // 설문조사 업데이트
  async updateSurvey(surveyId, surveyData) {
    const currentDate = new Date()
    const { _id, ...updateData } = surveyData // _id 필드 제거
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(surveyId) },
      { $set: { ...updateData, updateAt: currentDate } },
      { returnDocument: 'after' },
    )
    return result.value
  }

  //view하나 깎기
  async decreaseView(surveyId) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(surveyId) },
      { $inc: { views: -1 } },
      { returnDocument: 'after' },
    )
    return result.value
  }

  //ai로 만든 설문조사 생성
  async createAiSurvey(survey) {
    const result = await this.collection.insertOne(survey)
    return result.insertedId
  }
}

module.exports = new SurveysRepo()
