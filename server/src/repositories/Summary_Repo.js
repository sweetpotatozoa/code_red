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
          const createAt = new Date(r.createAt)
          const completeAt = new Date(r.completeAt)
          const timeDifference = completeAt - createAt
          return sum + (timeDifference > 0 ? timeDifference : 0)
        }, 0)
        avgResponseTime = totalTime / completedResponses.length / 1000 // 밀리초를 초로 변환
      }

      const views = survey.views || 0

      return {
        views,
        startCount,
        completedCount,
        dropoutCount,
        avgResponseTime: avgResponseTime.toFixed(2), // 소수점 두 자리로 반올림
        exposureStartRatio:
          views > 0 ? ((startCount / views) * 100).toFixed(2) : '0.00',
        exposureCompletedRatio:
          views > 0 ? ((completedCount / views) * 100).toFixed(2) : '0.00',
        exposureDropoutRatio:
          views > 0 ? ((dropoutCount / views) * 100).toFixed(2) : '0.00',
      }
    } catch (error) {
      console.error('Error in getSurveySummary:', error)
      throw error
    }
  }

  async getSurveyQuestions(surveyId) {
    try {
      const survey = await this.surveysCollection.findOne({ _id: surveyId })
      if (!survey) {
        throw new Error('Survey not found')
      }
      const responses = await this.responsesCollection
        .find({ surveyId: surveyId })
        .toArray()

      return survey.steps.map((step) => {
        const stepResponses = responses.flatMap((r) =>
          r.answers.filter((a) => a.stepId === step.id),
        )

        switch (step.type) {
          case 'welcome':
            return {
              ...step,
              views: survey.views || 0,
              responses: stepResponses.length,
            }
          case 'freeText':
            return {
              ...step,
              responses: stepResponses.length,
              contents: stepResponses.map((r) => r.answer),
            }
          case 'rating':
          case 'singleChoice':
          case 'multipleChoice':
            const optionCounts = step.options.reduce((acc, option) => {
              acc[option.id] = stepResponses.filter(
                (r) =>
                  r.answer === option.id ||
                  (Array.isArray(r.answer) && r.answer.includes(option.id)),
              ).length
              return acc
            }, {})
            return {
              ...step,
              totalResponses: stepResponses.length,
              options: step.options.map((option) => ({
                ...option,
                eachResponses: optionCounts[option.id] || 0,
              })),
            }
          case 'info':
          case 'link':
            return {
              ...step,
              clicks: stepResponses.length,
            }
          default:
            return step
        }
      })
    } catch (error) {
      console.error('Error in getSurveyQuestions:', error)
      throw error
    }
  }
}

module.exports = new SummaryRepo()
