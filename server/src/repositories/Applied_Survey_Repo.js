const mongodb = require('../utils/mongodb')

class AppliedSurveyRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('surveys')
  }

  async getAllSurveys() {
    const result = await this.collection.find({}).toArray()
    return result
  }

  async addSurvey(survey) {
    const result = await this.collection.insertOne(survey)
    return { ...survey, _id: result.insertedId } // 추가한 설문조사의 내용과 _id를 반환
  }
}

module.exports = new AppliedSurveyRepo()
