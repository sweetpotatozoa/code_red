const API_URI = process.env.REACT_APP_API_URI

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require('@google/generative-ai')

const fetcher = async (
  url,
  token,
  method,
  params = {},
  responseType = 'json',
) => {
  const resource =
    method === 'GET' ? `${url}?${new URLSearchParams(params)}` : url
  const init = ['POST', 'PUT', 'DELETE'].includes(method)
    ? {
        body: JSON.stringify(params),
        headers: {},
      }
    : { headers: {} }
  init.method = method
  init.headers['Content-Type'] = 'application/json'
  init.headers['x-access-token'] = token
  try {
    const res = await fetch(API_URI + resource, init)
    if (responseType === 'blob') {
      return await res.blob()
    }
    const data = await res.json()
    return data
  } catch (err) {
    return null
  }
}

class BackendApis {
  constructor() {
    this.token = localStorage.getItem('token')
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY // 환경변수에서 API 키 가져오기
    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `너는 웹사이트 고객 만족도 설문을 같이 만들어주는 도우미야. 
      해당 설문은 인앱 api고, 다른 사이트에 팝업 형식으로 띄워질거야.
      처음에는, 고객의 설문조사 목적이 무엇인지 먼저 물어봐줘. 
      예를 들어, 설문조사 목적은 '유료고객 이탈 막기, 유료전환 일으키기, 인터뷰 요청하기' 등등이 될 수 있어.
      그 다음에는, 유저에게 해당 목적에 맞는 설문 질문 5개와 각각 선택지 5개를 추천해줘. 
      그 다음에 고객과 소통하며 설문을 조금씩 바꿔나가. 추천을 마무리할 때 고객에게 수정하고 싶은 부분이 존재하는지 질문해줘. 그리고 존재한다면 어떤 방향으로 수정되길 원하는지 설명해달라고 부탁해.
      설문 답을 받는 유형은 '객관식(중복 불가), 객관식(중복 가능), 주관식, 별점, 외부링크, 안내'가 있어.`,
    })
  }

  setToken(token) {
    this.token = token
    localStorage.setItem('token', token)
  }

  getToken() {
    return localStorage.getItem('token')
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('token')
  }

  //소유한 설문조사 목록 가져오기
  async getSurveys(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  // 설문조사 하나의 isDeploy 값만 가져오기
  async getSurvey(surveyId) {
    return await fetcher(
      `/api/adminSurvey/getSurvey/${surveyId}`,
      this.getToken(),
      'GET',
    )
  }

  //유저 정보 가져오기
  async getUserInfo(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/userInfo',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  // 인증 상태 확인 메소드
  async checkAuth(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/auth/check',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //화면 설정 저장하기
  async editSurveyPosition(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/surveyPosition',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //설문조사 삭제하기
  async deleteSurvey(surveyId, method = 'DELETE', params = {}) {
    const result = await fetcher(
      `/api/adminSurvey/deleteSurvey/${surveyId}`,
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //설문조사 배포상태 변경하기
  async toggleSurveyDeploy(surveyId, method = 'PUT', params = {}) {
    const result = await fetcher(
      `/api/adminSurvey/toggleSurveyDeploy/${surveyId}`,
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //설문조사 템플릿 가져오기
  async getTemplates(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/templates',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //설문조사 템플릿으로 설문조사 생성하기
  async createSurvey(templateId, method = 'POST', params = {}) {
    const result = await fetcher(
      `/api/adminSurvey/templates/${templateId}`,
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //회원가입
  async register(method = 'POST', params = {}) {
    const result = await fetcher('/api/auth/register', '', method, params)
    console.log(result)
    return result
  }

  //로그인
  async login(method = 'POST', params = {}) {
    const result = await fetcher('/api/auth/login', '', method, params)
    if (result.token) {
      this.setToken(result.token)
    }
    return result
  }

  //로그아웃
  logout() {
    this.clearToken()
  }

  //유저아이디 가져오기
  async getId(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/getId',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //연결상태 확인하기
  async checkConnect(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/checkConnect',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  //온보딩 완료 후 정보 저장하기
  async saveOnboardingInfo(method = 'POST', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/saveOnboardingInfo',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  async getSurveySummary(surveyId) {
    return await fetcher(`/api/adminSurvey/${surveyId}`, this.getToken(), 'GET')
  }

  async getSurveyQuestions(surveyId) {
    return await fetcher(
      `/api/adminSurvey/${surveyId}/questions`,
      this.getToken(),
      'GET',
    )
  }

  async isDeployToggle(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/isDeployToggle',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  async getConnectStatus(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/connectStatus',
      this.getToken(),
      method,
      params,
    )
    return result
  }

  async editSurvey(surveyId) {
    return await fetcher(
      `/api/adminSurvey/edit/${surveyId}`,
      this.getToken(),
      'GET',
    )
  }

  async updateSurvey(surveyId, surveyData) {
    return await fetcher(
      `/api/adminSurvey/surveyUpdate/${surveyId}`,
      this.getToken(),
      'PUT',
      surveyData,
    )
  }

  async deploySurvey(surveyId, surveyData) {
    return await fetcher(
      `/api/adminSurvey/surveyDeploy/${surveyId}`,
      this.getToken(),
      'PUT',
      surveyData,
    )
  }

  async getResponse(surveyId) {
    return await fetcher(
      `/api/adminSurvey/response/${surveyId}`,
      this.getToken(),
      'GET',
    )
  }

  async deleteResponse(responseId) {
    return await fetcher(
      `/api/adminSurvey/response/${responseId}`,
      this.getToken(),
      'DELETE',
    )
  }

  async downloadResponses(surveyId) {
    return await fetcher(
      `/api/adminSurvey/download/${surveyId}`,
      this.getToken(),
      'GET',
      {},
      'blob', // 응답 타입을 'blob'으로 지정
    )
  }

  async skipOnboarding() {
    return await fetcher(
      '/api/adminSurvey/skipOnboarding',
      this.getToken(),
      'PUT',
    )
  }

  // Google Gemini API와의 대화 시작 메서드
  async startChatConversation(history, message) {
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: 'text/plain',
    }

    const chatSession = this.model.startChat({
      generationConfig,
      history,
    })

    const result = await chatSession.sendMessage(message)
    let text = await result.response.text()

    // 응답 텍스트 처리
    text = text
      .replace(/\*\*/g, '') // '**' 제거
      .replace(/\n/g, '<br />') // 줄바꿈 처리

    return text
  }
}

export default new BackendApis()
