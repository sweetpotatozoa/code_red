const { ObjectId } = require('mongodb')
const mongodb = require('../utils/mongodb')

class SummaryRepo {
  constructor() {
    this.surveysCollection = mongodb.mainDb.collection('surveys')
    this.responsesCollection = mongodb.mainDb.collection('responses')
  }

  async getSurveySummary(surveyId) {
    try {
      const survey = await this.surveysCollection.findOne({ _id: surveyId })
      if (!survey) {
        throw new Error('Survey not found')
      }
      const responses = await this.responsesCollection
        .find({ surveyId: surveyId })
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

      const views = survey.views || 0

      return {
        views,
        startCount,
        completedCount,
        dropoutCount,
        avgResponseTime,
        exposureStartRatio: views > 0 ? startCount / views : 0,
        exposureCompletedRatio: views > 0 ? completedCount / views : 0,
        exposureDropoutRatio: views > 0 ? dropoutCount / views : 0,
      }
    } catch (error) {
      console.error('Error in getSurveySummary:', error)
      throw error
    }
  }
}

module.exports = new SummaryRepo()
