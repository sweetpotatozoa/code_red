const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')

class TemplatesRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('templates')
  }

  //모든 템플릿 가져오기
  async getTemplates() {
    return this.collection
      .aggregate([
        { $unwind: '$templates' },
        { $replaceRoot: { newRoot: '$templates' } },
      ])
      .toArray()
  }

  //선택한 템플릿 가져오기
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

  //연결 확인용 샘플 템플릿 가져오기
  async getConnectSample() {
    return this.collection.findOne(
      { type: 'connectSample' },
      { projection: { _id: 0 } },
    )
  }
}

module.exports = new TemplatesRepo()
