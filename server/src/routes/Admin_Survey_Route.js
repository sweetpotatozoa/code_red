const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const wrapAsync = require('../utils/wrapAsync')
const AdminSurveyController = require('../controllers/Admin_Survey_Controller')

const fakeAuth = (req, res, next) => {
  req.user = { id: '6676c3246488a1214054ca26' }
  next()
}

// userId를 이용하여 설문조사 목록을 가져옴.
router.get('/', fakeAuth, wrapAsync(AdminSurveyController.getSurveys))

//온보딩 완료 후 정보 저장하기
router.post(
  '/saveOnboardingInfo',
  fakeAuth,
  wrapAsync(AdminSurveyController.saveOnboardingInfo),
)

// 연결상태 확인하기
router.get(
  '/checkConnect',
  fakeAuth,
  wrapAsync(AdminSurveyController.checkConnect),
)

// 유저 아이디 반환
router.get('/getId', fakeAuth, wrapAsync(AdminSurveyController.getUserId))

// 각 설문조사의 배포상태를 변경함
router.put(
  '/toggleSurveyDeploy/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.toggleDeploy),
)

// 각 설문조사 삭제
router.delete(
  '/deleteSurvey/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.deleteSurvey),
)

// 유저정보 가져오기
router.get('/userInfo', fakeAuth, wrapAsync(AdminSurveyController.getUserInfo))

// 설문조사 뜨는 위치 변경
router.put(
  '/surveyPosition',
  fakeAuth,
  wrapAsync(AdminSurveyController.updateSurveyPosition),
)

//설문조사 템플릿 가져오기
router.get(
  '/templates',
  fakeAuth,
  wrapAsync(AdminSurveyController.getTemplates),
)

// 설문조사 생성
router.post(
  '/templates/:templateId',
  fakeAuth,
  wrapAsync(AdminSurveyController.createSurvey),
)

// 설문조사 질문별 요약
router.get(
  '/:surveyId/questions',
  fakeAuth,
  wrapAsync(AdminSurveyController.getSurveyQuestions),
)

// 수정할 설문조사 정보 가져오기
router.get(
  '/edit/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.getSurveyForEdit),
)

// 설문조사 업데이트
router.put(
  '/surveyUpdate/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.updateSurvey),
)

// 설문조사 업데이트하고 배포하기
router.put(
  '/surveyDeploy/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.updateSurveyAndDeploy),
)

// 설문조사 개별 응답 가져오기
router.get(
  '/response/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.getResponses),
)

// 설문조사 응답 삭제
router.delete(
  '/response/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.deleteResponse),
)

// 설문조사 isDeploy 상태만 가져오기
router.get(
  '/getSurvey/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.getSurvey),
)

// 설문조사 응답 다운로드
  router.get(
    '/download/:id',
    fakeAuth,
    wrapAsync(AdminSurveyController.downloadResponses),
  ),

  // 설문조사 응답 요약
  router.get(
    '/:surveyId',
    fakeAuth,
    wrapAsync(AdminSurveyController.getSurveySummary),
  ),


module.exports = router
