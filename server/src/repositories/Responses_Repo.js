const mongoose = require('mongoose')
const mongodb = require('../utils/mongodb')

class ResponsesRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('responses')
  }
}

module.exports = new ResponsesRepo()
