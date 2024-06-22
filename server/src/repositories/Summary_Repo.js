const mongodb = require('../utils/mongodb')
const { ObjectId } = require('mongodb')

class SummaryRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.surveysCollection = this.db.collection('surveys')
    this.responsesCollection = this.db.collection('responses')
  }

  async getSurveySummary(surveyId) {
    const survey = await this.surveysCollection.findOne({
      _id: new ObjectId(surveyId),
    })
    const responses = await this.responsesCollection
      .find({ surveyId: new ObjectId(surveyId) })
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
      exposureCount: survey.exposureCount || 0,
      startCount,
      completedCount,
      dropoutCount,
      avgResponseTime,
      exposureStartRatio: (startCount / (survey.exposureCount || 1)) * 100,
      exposureCompletedRatio:
        (completedCount / (survey.exposureCount || 1)) * 100,
      exposureDropoutRatio: (dropoutCount / (survey.exposureCount || 1)) * 100,
    }
  }
}

module.exports = new SummaryRepo()
