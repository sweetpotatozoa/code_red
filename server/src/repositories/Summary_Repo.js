const { ObjectId } = require('mongodb')
const mongodb = require('../utils/mongodb')

class SummaryRepo {
  constructor() {
    this.surveysCollection = mongodb.mainDb.collection('surveys')
    this.responsesCollection = mongodb.mainDb.collection('responses')
  }

  async getSurveySummary(surveyId) {
    try {
      const objectId = new ObjectId(surveyId)
      const survey = await this.surveysCollection.findOne({ _id: objectId })
      if (!survey) {
        throw new Error('Survey not found')
      }
      const responses = await this.responsesCollection
        .find({ surveyId: objectId })
        .toArray()
      const startCount = responses.length
      const completedResponses = responses.filter((r) => r.isComplete)
      const completedCount = completedResponses.length
      const dropoutCount = startCount - completedCount

      let avgResponseTime = 0
      if (completedResponses.length > 0) {
        const totalTime = completedResponses.reduce((sum, r) => {
          return sum + (new Date(r.completeAt) - new Date(r.createdAt))
        }, 0)
        avgResponseTime = totalTime / completedResponses.length
      }

      return {
        views: survey.views || 0,
        startCount,
        completedCount,
        dropoutCount,
        avgResponseTime,
        exposureStartRatio: (startCount / survey.views) * 100 || 0,
        exposureCompletedRatio: (completedCount / survey.views) * 100 || 0,
        exposureDropoutRatio: (dropoutCount / survey.views) * 100 || 0,
      }
    } catch (error) {
      console.error('Error in getSurveySummary:', error)
      throw error
    }
  }
}

module.exports = new SummaryRepo()
