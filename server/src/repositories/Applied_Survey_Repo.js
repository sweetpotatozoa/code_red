const mongodb = require('../utils/mongodb')

class AppliedSurveyRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('surveys')
    this.responsesCollection = this.db.collection('responses')
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
    return { ...survey, _id: result.insertedId }
  }

  async addResponse(response) {
    const result = await this.responsesCollection.insertOne(response)
    return { ...response, _id: result.insertedId }
  }

  async updateResponse(responseId, response) {
    const result = await this.responsesCollection.updateOne(
      { _id: new mongodb.ObjectId(responseId) },
      { $set: { responses: response.responses } },
    )
    return result
  }
}

module.exports = new AppliedSurveyRepo()
