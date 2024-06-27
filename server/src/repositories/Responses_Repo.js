const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')

class ResponsesRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('responses')
  }

  // 설문조사 요약에 필요한 정보 가져오기
  async getSurveyResponses(surveyId) {
    const responses = await this.collection
      .find(
        { surveyId: new mongoose.Types.ObjectId(surveyId) },
        { projection: { _id: 0, createAt: 1, completeAt: 1, isComplete: 1, answers: 1 } },
      )
      .toArray()
    return responses  
  }
}

module.exports = new ResponsesRepo()
