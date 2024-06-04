const mongodb = require('../utils/mongodb')

class appliedSurveyRepo {
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
    return result
  }
}

module.exports = new appliedSurveyRepo()
