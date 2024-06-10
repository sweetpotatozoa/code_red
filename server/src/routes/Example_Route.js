const express = require('express')
const auth = require('../middleware/auth')

const router = express.Router()

router.get(
  '/',
  auth,
  wrapAsync(() => {
    return res.status(204).send()
  }),
)

function wrapAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

module.exports = router
