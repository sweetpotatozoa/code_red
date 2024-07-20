const errorHandler = (
  err,
  functionName = 'unknown Function',
  customErrorHandlers = {},
) => {
  if (customErrorHandlers[err.message]) {
    return customErrorHandlers[err.message](err)
  } else if (err.message === 'No user found') {
    return { status: 404, message: '해당하는 유저가 없습니다.' }
  } else if (err.message === 'No survey found') {
    return { status: 404, message: '해당하는 설문조사가 없습니다.' }
  } else if (err.message === 'You are not the owner of this survey') {
    return { status: 403, message: '해당 설문에 대한 권한이 없습니다.' }
  } else if (err.message === 'User name already exists') {
    return { status: 400, message: '해당 아이디는 이미 존재합니다.' }
  } else if (err.message === 'Invalid user name or password') {
    return { status: 400, message: '아이디 혹은 비밀번호가 일치하지 않습니다' }
  } else {
    console.error(`Error in ${functionName}`, err)
    return { status: 500, message: '서버 오류가 발생했습니다.' }
  }
}

module.exports = errorHandler
