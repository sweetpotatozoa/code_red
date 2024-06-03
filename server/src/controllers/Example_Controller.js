const Service = require('../services/Example_Service')

class MainController {
  async exampleController() {
    const data = await Service.exampleFunction1()
    const result = await Service.exampleFunction2(data)
    return result
  }

  async login() {
    const logInResult = await Service.login()
    const tokenResult = await Service.getToken(logInResult?._id)
    return { ...logInResult, token: tokenResult }
  }
}

module.exports = new MainController()
