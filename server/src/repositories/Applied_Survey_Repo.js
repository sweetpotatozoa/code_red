const mongodb = require('../utils/mongodb')

class AppliedSurveyRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('surveys')
  }

  async getAllSurveys() {
    try {
      const result = await this.collection.find({}).toArray()
      return result
    } catch (error) {
      console.error('Error retrieving surveys:', error)
      throw new Error('Could not retrieve surveys')
    }
  }

  async addSurvey(survey) {
    try {
      const result = await this.collection.insertOne(survey)
      return result
    } catch (error) {
      console.error('Error adding survey:', error)
      throw new Error('Could not add survey')
    }
  }
}

module.exports = new AppliedSurveyRepo()
