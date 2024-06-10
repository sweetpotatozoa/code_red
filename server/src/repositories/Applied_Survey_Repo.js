const mongodb = require('../utils/mongodb')

class AppliedSurveyRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('surveys')
    this.responsesCollection = this.db.collection('responses') // 응답 컬렉션 추가
  }

  async getAllSurveys() {
    const result = await this.collection.find({}).toArray()
    return result
  }

  async getSurveysByCustomerId(customerId) {
    const result = await this.collection.find({ customerId }).toArray()
    return result
  }

  async addSurvey(survey) {
    const result = await this.collection.insertOne(survey)
    return { ...survey, _id: result.insertedId } // 추가한 설문조사의 내용과 _id를 반환
  }

  async addResponse(response) {
    const result = await this.responsesCollection.insertOne(response)
    return { ...response, _id: result.insertedId } // 추가한 응답의 내용과 _id를 반환
  }
}

module.exports = new AppliedSurveyRepo()
