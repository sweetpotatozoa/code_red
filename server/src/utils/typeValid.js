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

// str인지 확인하는 함수
const isString = (value) => {
  return typeof value === 'string'
}

// 아이디, 비밀번호가 유효한지 확인하는 함수
const isValidUsernameOrPassword = (value) => {
  const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
  return regex.test(value)
}

module.exports = { isObjectId, isInteger, isString, isValidUsernameOrPassword }
