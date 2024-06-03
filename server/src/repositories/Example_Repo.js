const mongodb = require('../utils/mongodb')

class MainRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('example')
  }

  async exampleFunction() {
    const result = await this.collection.find({}).toArray()
    return result
  }
}

module.exports = new MainRepo()
