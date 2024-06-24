// utils.js
const mongoose = require('mongoose')

// objectId인지 확인하는 함수
const isObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id)
}

// 정수인지 확인하는 함수
const isInteger = (value) => {
  if (typeof value === 'number') {
    return Number.isInteger(value)
  }
  if (typeof value === 'string') {
    const parsedValue = parseInt(value, 10)
    return !isNaN(parsedValue) && parsedValue.toString() === value
  }
  return false
}

module.exports = { isObjectId, isInteger }
