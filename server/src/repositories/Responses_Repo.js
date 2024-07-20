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
        {
          projection: {
            _id: 1,
            createAt: 1,
            completeAt: 1,
            isComplete: 1,
            answers: 1,
          },
        },
      )
      .toArray()
    return responses
  }

  // 개별 응답 가져오기
  async getResponseById(responseId) {
    const response = await this.collection.findOne({
      _id: new mongoose.Types.ObjectId(responseId),
    })
    return response
  }

  // 응답 삭제하기
  async deleteResponse(responseId) {
    const result = await this.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(responseId),
    })
    return result.deletedCount === 1
  }
}

module.exports = new ResponsesRepo()
