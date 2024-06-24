const errorHandler = (
  err,
  functionName = 'unknown Function',
  customErrorHandlers = {},
) => {
  if (customErrorHandlers[err.message]) {
    return customErrorHandlers[err.message](req, err)
  } else if (err.message === 'No user found') {
    return { status: 404, message: 'No user found' }
  } else if (err.message === 'No survey found') {
    return { status: 404, message: 'No survey found' }
  } else if (err.message === 'You are not the owner of this survey') {
    return { status: 403, message: 'You are not the owner of this survey' }
  } else {
    console.error(`Error in ${functionName}`, err)
    return { status: 500, message: 'Internal server error' }
  }
}

module.exports = errorHandler
