const UsersRepo = require('../repositories/Users_Repo')
const SurveysRepo = require('../repositories/Surveys_Repo')
const templatesRepo = require('../repositories/Templates_Repo')

class AdminSurveyService {
  //헬퍼 함수

  //유저 아이디 존재 검사
  async checkUserIdExist(userId) {
    const doesUserIdExist = await UsersRepo.checkUserIdExist(userId)
    if (!doesUserIdExist) {
      throw new Error('No user found')
    }
  }

  //설문조사 아이디 존재 검사
  async checkSurveyIdExist(surveyId) {
    const doesSurveyIdExist = await SurveysRepo.checkSurveyIdExist(surveyId)
    if (!doesSurveyIdExist) {
      throw new Error('No survey found')
    }
  }

  //설문조사 소유권 검사
  async checkSurveyOwnership(userId, surveyId) {
    const isSurveyOwner = await SurveysRepo.checkSurveyOwnership(
      userId,
      surveyId,
    )
    if (!isSurveyOwner) {
      throw new Error('You are not the owner of this survey')
    }
  }

  //실제 함수

  // 설문조사 목록 가져오기
  async getSurveys(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    const surveys = await SurveysRepo.getSurveys(userId)
    if (surveys.length === 0) {
      throw new Error('No survey found')
    }
    return surveys
  }

  // 설문조사 배포 상태 변경
  async toggleDeploy(userId, surveyId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    await this.checkSurveyIdExist(surveyId) // 설문조사 존재 검사
    await this.checkSurveyOwnership(userId, surveyId) // 설문조사 소유권 검사
    return SurveysRepo.toggleDeploy(surveyId)
  }

  // 설문조사 삭제
  async deleteSurvey(userId, surveyId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    await this.checkSurveyIdExist(surveyId) // 설문조사 유효성 검사
    await this.checkSurveyOwnership(userId, surveyId) // 설문조사 소유권 검사
    return SurveysRepo.deleteSurvey(surveyId)
  }

  // 유저정보 가져오기
  async getUserInfo(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    const userInfo = await UsersRepo.getUserInfo(userId)
    return {
      realName: userInfo.realName || '익명의 유저',
      surveyPosition: userInfo.surveyPosition || 4,
      isConnect: userInfo.isConnect || false,
    }
  }

  // 설문조사 뜨는 위치 변경
  async updateSurveyPosition(userId, surveyPosition) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사

    // surveyPosition 범위 검증
    const validPositions = [1, 2, 3, 4]
    if (!validPositions.includes(surveyPosition)) {
      throw new Error('Invalid survey position')
    }

    return await UsersRepo.updateSurveyPosition(userId, surveyPosition)
  }

  // 설문조사 템플릿 가져오기
  async getTemplates(userId) {
    await this.checkUserIdExist(userId) // 유저 아이디 존재 검사
    return templatesRepo.getTemplates()
  }
}

module.exports = new AdminSurveyService()
