const mongodb = require('../utils/mongodb')
const { ObjectId } = require('mongodb')

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

  async getSurveysByQuery(query) {
    const result = await this.collection.find(query).toArray()
    return result
  }

  async addResponse(response) {
    const surveyId = new ObjectId(response.surveyId)
    const result = await this.responsesCollection.insertOne({
      ...response,
      surveyId,
    })
    return { ...response, _id: result.insertedId }
  }

  async updateResponse(responseId, response) {
    const result = await this.responsesCollection.updateOne(
      { _id: new ObjectId(responseId) },
      {
        $set: {
          answers: response.answers,
          completeAt: response.completeAt,
          isComplete: response.isComplete,
        },
      },
    )
    return result
  }

  async incrementExposureCount(surveyId) {
    const result = await this.collection.updateOne(
      { _id: new ObjectId(surveyId) },
      { $inc: { exposureCount: 1 } },
    )
    return result
  }
}

module.exports = new AppliedSurveyRepo()
