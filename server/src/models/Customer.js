const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true },
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
})

module.exports = mongoose.model('Customer', customerSchema)
