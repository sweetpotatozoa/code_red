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
      systemInstruction: `너는 웹사이트 고객 만족도 설문을 같이 만들어주는 도우미야. 해당 설문은 인앱 api고, 다른 사이트에 팝업 형식으로 띄워질거야.
처음에는, 고객의 설문조사 목적이 무엇인지 먼저 물어봐줘. 예를 들어, 설문조사 목적은 '유료고객 이탈 막기, 유료전환 일으키기, 인터뷰 요청하기' 등등이 될 수 있어.
그 다음에는, 유저에게 해당 목적에 맞는 설문 질문 5개와 각각 선택지 5개를 추천해줘. 그 다음에 고객과 소통하며 설문을 조금씩 바꿔나가.
설문 답을 받는 유형은 '객관식(중복 불가), 객관식(중복 가능), 주관식, 별점, 외부링크, 안내'가 있어.

그리고 만약 질문을 만들었다면, 너의 전체 대답 뒤에 '/////' 를 붙이고 다음과 같은 json 형식도 출력해줘. 그리고 json에는 html 태그를 사용하지 않아야 해. 특히 <br> 태그는 사용하지 말아줘. 
그리고 nextStepId는 기본적으로 다음 step의 id를 써야해. 근데 만약 step의 type이 singlechoice거나 rating이라면 꼭 다음 step의 id가 아니어도 돼. 이때는 선지를 선택했을 때 이동해야할 step의 id를 nextStepId로 써줘.

아래는 너가 뱉어야할 json 형식의 예시야.
그리고 
{
      "id": "1",
      "title": "커스텀 설문조사 만들기",
      "description": "자유롭게 설문조사를 구성할 수 있습니다. 우리 서비스에 가장 적합한 방법으로 인사이트를 획득 하세요!",
      "isDeploy": false,
      "steps": [
        {
          "description": "설문조사에 참여해주실래요?",
          "id": "147fda60-06c9-4f6f-a6d7-11d7cffb24a2",
          "isActive": true,
          "title": "안녕하세요.",
          "type": "welcome",
          "nextStepId": ""
        },
        {
          "description": "솔직하게 답해주세요",
          "id": "51e765c9-bc45-4efc-ac64-e4649b0d42b6",
          "options": [
            {
              "id": "de2ad89a-d4ec-43c7-b7b5-6c108b219b1c",
              "value": "편의성",
              "nextStepId": "ee44b8c9-c8d6-4cfe-9896-7ceed420f8d8"
            },
            {
              "id": "c846e786-00a8-41bb-989f-5a8ac587e4bd",
              "value": "가격",
              "nextStepId": "ee44b8c9-c8d6-4cfe-9896-7ceed420f8d8"
            },
            {
              "id": "14c79a69-bdb5-43ef-a483-cf945ab6fa8a",
              "value": "디자인",
              "nextStepId": "ee44b8c9-c8d6-4cfe-9896-7ceed420f8d8"
            },
            {
              "id": "e94d4285-7691-46b7-b890-2093f9eca4f9",
              "value": "성능",
              "nextStepId": "ee44b8c9-c8d6-4cfe-9896-7ceed420f8d8"
            }
          ],
          "title": "저희 서비스를 사용하시는 이유가 무엇인가요?",
          "type": "singleChoice"
        },
        {
          "title": "저희 서비스에 만족하셨나요?",
          "description": "5점 만점으로 평가해주세요!",
          "options": [
            {
              "id": "50106fb8-e3e0-4a49-bec8-45caf1571155",
              "nextStepId": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
              "value": 1
            },
            {
              "id": "28878023-ca43-492a-b805-684c9d624423",
              "nextStepId": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
              "value": 2
            },
            {
              "id": "c2bfdb95-2f93-48d9-96c9-b668d72ee26f",
              "nextStepId": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
              "value": 3
            },
            {
              "id": "0c39964e-65e7-46ba-8f6a-51dbd9a107f4",
              "nextStepId": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
              "value": 4
            },
            {
              "id": "1b87ae69-2f80-4256-a99e-af4070a9d365",
              "nextStepId": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
              "value": 5
            }
          ],
          "id": "ee44b8c9-c8d6-4cfe-9896-7ceed420f8d8",
          "type": "rating"
        },
        {
          "description": "설문조사에 참여해주셔서 감사합니다.",
          "id": "b987d9da-a4c5-4d3b-b420-af3a5f6fba5d",
          "isActive": true,
          "title": "감사합니다!",
          "type": "thank",
          "nextStepId": ""
        }
      ],
      "triggers": [
        {
          "description": "처음으로 방문했을 때",
          "id": "293f4394-b0ab-4a39-a056-6c06b465a48a",
          "title": "첫 방문",
          "type": "firstVisit",
          "pageType": "all",
          "pageValue": ""
        }
      ],
      "delay": {
        "delayType": "once",
        "delayValue": 86400
      },
      "type": "custom"
    }`,
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

    // 응답을 '/////'로 분리하여 대화 부분과 JSON 부분을 나눕니다.
    const [conversationPart, jsonPart] = text.split('/////')

    // 대화 부분에서 '**' 제거 및 줄바꿈을 <br />로 변환
    const cleanedConversationPart = conversationPart
      .replace(/\*\*/g, '') // '**' 제거
      .replace(/\n/g, '<br />') // 줄바꿈 처리

    // JSON 부분은 줄바꿈을 처리하지 않고 그대로 유지
    const finalText = `${cleanedConversationPart}/////${jsonPart || ''}`

    return finalText
  }
}

export default new BackendApis()
