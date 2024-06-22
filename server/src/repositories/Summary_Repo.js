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
