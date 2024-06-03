const jwt = require('jsonwebtoken')
const configs = require('../utils/configs')
const MainRepo = require('../repositories/Example_Repo')

class MainService {
  async exampleFunction1() {
    const result = await MainRepo.exampleFunction()
    return result
  }

  async exampleFunction2(data) {
    return data.filter((elem) => !!elem)
  }

  async getToken(userId) {
    const tokenPayload = { user: { id: userId } }
    const token = jwt.sign(tokenPayload, configs.accessTokenSecret)
    return token
  }
}

module.exports = new MainService()
