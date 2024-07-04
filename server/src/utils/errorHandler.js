const errorHandler = (
  err,
  functionName = 'unknown Function',
  customErrorHandlers = {},
) => {
  if (customErrorHandlers[err.message]) {
    return customErrorHandlers[err.message](err)
  } else if (err.message === 'No user found') {
    return { status: 404, message: 'No user found' }
  } else if (err.message === 'No survey found') {
    return { status: 404, message: 'No survey found' }
  } else if (err.message === 'You are not the owner of this survey') {
    return { status: 403, message: 'You are not the owner of this survey' }
  } else if (err.message === 'User name already exists') {
    return { status: 400, message: 'User name already exists' }
  } else if (err.message === 'Invalid user name or password') {
    return { status: 400, message: '아이디 혹은 비밀번호가 일치하지 않습니다' }
  } else {
    console.error(`Error in ${functionName}`, err)
    return { status: 500, message: 'Internal server error' }
  }
}

module.exports = errorHandler
