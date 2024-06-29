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
}

module.exports = new TemplatesRepo()
