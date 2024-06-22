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

      // survey 컬렉션에서는 _id로 조회
      const survey = await this.surveysCollection.findOne({ _id: objectId })

      if (!survey) {
        throw new Error('Survey not found')
      }

      // response 컬렉션에서는 surveyId로 조회
      const responses = await this.responsesCollection
        .find({ surveyId: objectId })
        .toArray()

      // 여기서 필요한 계산을 수행합니다
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

  // 기타 메서드들...
}

module.exports = SummaryRepo
