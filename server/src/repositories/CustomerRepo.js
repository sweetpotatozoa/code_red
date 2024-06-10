const mongodb = require('../utils/mongodb')
const Customer = require('../models/Customer')

class CustomerRepo {
  constructor() {
    this.db = mongodb.mainDb
    this.collection = this.db.collection('customers')
  }

  async findCustomerById(customerId) {
    return await Customer.findOne({ customerId })
  }
}

module.exports = new CustomerRepo()
