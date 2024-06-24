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
        { $project: { id: 1, title: 1, description: 1 } }, // 원하는 필드만 선택
      ])
      .toArray()
  }
}

module.exports = new TemplatesRepo()
