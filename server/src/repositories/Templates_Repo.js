const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')

class TemplatesRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('templates')
  }

  async getTemplates() {
    return this.collection
      .aggregate([
        { $unwind: '$templates' },
        { $replaceRoot: { newRoot: '$templates' } },
      ])
      .toArray()
  }

  async getTemplate(templateId) {
    const result = await this.collection.findOne(
      { templates: { $elemMatch: { id: templateId } } },
      { projection: { 'templates.$': 1 } },
    )

    if (result && result.templates && result.templates.length > 0) {
      return result.templates[0]
    } else {
      return null
    }
  }
}

module.exports = new TemplatesRepo()
