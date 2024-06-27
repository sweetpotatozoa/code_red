const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const wrapAsync = require('../utils/wrapAsync')
const AdminSurveyController = require('../controllers/Admin_Survey_Controller')

const fakeAuth = (req, res, next) => {
  req.user = { id: '6676c3246488a1214054ca26' }
  next()
}

// userId를 이용하여 설문조사 목록을 가져옴. 테스트할 때 뒤에 아무것도 안 붙여야 함.
router.get('/', fakeAuth, wrapAsync(AdminSurveyController.getSurveys))

// 각 설문조사의 배포상태를 변경함
router.put(
  '/toggleDeploy/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.toggleDeploy),
)

// 각 설문조사 삭제
router.delete(
  '/deleteSurvey/:id',
  fakeAuth,
  wrapAsync(AdminSurveyController.deleteSurvey),
)

// 설문조사 뜨는 위치 가져오기
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
  '/templates',
  fakeAuth,
  wrapAsync(AdminSurveyController.createSurvey),
)

// 설문조사 응답 요약
router.get(
  '/:surveyId',
  fakeAuth,
  wrapAsync(AdminSurveyController.getSurveySummary),
)

// 설문조사 질문별 요약
router.get(
  '/:surveyId/questions',
  fakeAuth,
  wrapAsync(AdminSurveyController.getSurveyQuestions),
)

// 설문조사 생성
router.post(
  '/templates',
  auth,
  wrapAsync(async (req, res) => {
    const result = await AdminSurveyController.createSurvey(
      req.body,
      req.user.id,
    ) // userId saved in jwt added by auth middleware
    return res.status(result.status).send(result)
  }),
)

// 수정할 설문조사 정보 가져오기
router.get(
  '/edit/:id',
  auth,
  wrapAsync(async (req, res) => {
    const result = await AdminSurveyController.getSurvey(
      req.params.id,
      req.user.id,
    ) //각 설문조사 아이디, userId saved in jwt added by auth middleware
    return res.status(result.status).send(result)
  }),
)

// 설문조사 업데이트
router.put(
  '/surveyUpdate/:id',
  auth,
  wrapAsync(async (req, res) => {
    const result = await AdminSurveyController.updateSurvey(
      req.params.id,
      req.user.id,
      req.body,
    ) //각 설문조사 아이디, userId saved in jwt added by auth middleware
    return res.status(result.status).send(result)
  }),
)

// 설문조사 업데이트하고 배포하기
router.put(
  '/surveyDeploy/:id',
  auth,
  wrapAsync(async (req, res) => {
    const result = await AdminSurveyController.updateSurveyAndDeploy(
      req.params.id,
      req.user.id,
      req.body,
    ) //각 설문조사 아이디, userId saved in jwt added by auth middleware
    return res.status(result.status).send(result)
  }),
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

// 설문조사 응답 다운로드
router.get(
  '/download/:id',
  auth,
  wrapAsync(async (req, res) => {
    const result = await AdminSurveyController.downloadResponse(
      req.params.id,
      req.user.id,
    ) //각 설문조사 아이디, userId saved in jwt added by auth middleware
    return res.status(result.status).send(result)
  }),
)

module.exports = router
