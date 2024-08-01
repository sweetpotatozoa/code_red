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

그리고 만약 질문을 만들었다면, 너의 전체 대답 뒤에 '////' 를 붙이고 다음과 같은 json 형식도 출력해줘. 그리고 json에는 html 태그를 사용하지 않아야 해. 특히 <br> 태그는 사용하지 말아줘. 
그리고 nextStepId는 기본적으로 다음 step의 id를 써야해. 근데 만약 step의 type이 singlechoice거나 rating이라면 꼭 다음 step의 id가 아니어도 돼. 이때는 선지를 선택했을 때 이동해야할 step의 id를 nextStepId로 써줘.

아래는 너가 뱉어야할 json 형식의 예시야.
{
  "title": "만족도 조사",
  "description": "자유롭게 설문조사를 구성할 수 있습니다. 우리 서비스에 가장 적합한 방법으로 인사이트를 획득 하세요!",
  "isDeploy": false,
  "steps": [
    {
      "description": "설문조사에 참여해주실래요?",
      "id": "70cd4654-c8b8-4c42-96c8-b23c1f7d8788",
      "isActive": false,
      "title": "안녕하세요.",
      "type": "welcome",
      "nextStepId": ""
    },
    {
      "description": "모든 직원의 수를 기준으로 해주세요.",
      "id": "30135750-c75f-467b-ae03-6830454ca215",
      "options": [
        {
          "id": "7af8ada0-8668-4c0c-b63c-cdbcaac2b57a",
          "value": "1~5명",
          "nextStepId": "48f74b8c-5c53-4003-80c0-101ecd463d54"
        },
        {
          "id": "3e7d9a64-1f67-4169-a778-04bfb21f1155",
          "value": "6~10명",
          "nextStepId": "48f74b8c-5c53-4003-80c0-101ecd463d54"
        },
        {
          "id": "8c6eb0fd-2d17-4a2d-985b-008f3d0d192f",
          "value": "11~30명",
          "nextStepId": "48f74b8c-5c53-4003-80c0-101ecd463d54"
        },
        {
          "id": "f94a06fe-91bc-48b7-bde8-69249eafa127",
          "value": "30명 이상",
          "nextStepId": "48f74b8c-5c53-4003-80c0-101ecd463d54"
        }
      ],
      "title": "회사의 크기가 어떻게 되시나요?",
      "type": "singleChoice"
    },
    {
      "title": "저희 서비스에 만족하셨나요?",
      "description": "5점 만점으로 평가해주세요!",
      "options": [
        {
          "id": "938ff377-4595-4631-b3dc-abafac8fd536",
          "nextStepId": "5e854187-8fdb-4687-96f2-c7f3b5d6fe96",
          "value": 1
        },
        {
          "id": "3d961b8d-93ab-45c1-a9f3-9837e036612b",
          "nextStepId": "5e854187-8fdb-4687-96f2-c7f3b5d6fe96",
          "value": 2
        },
        {
          "id": "3a050413-00bc-481f-8eb3-e0d57e155077",
          "nextStepId": "a9b709bc-c80c-45c0-bd3d-62798a5838a5",
          "value": 3
        },
        {
          "id": "b30af2be-fe46-4bd3-aba5-d507fee5b8c8",
          "nextStepId": "89d47be1-324e-4e8f-ac87-16345a19822d",
          "value": 4
        },
        {
          "id": "de20166a-1fff-48b5-acfa-994c9a2aae64",
          "nextStepId": "89d47be1-324e-4e8f-ac87-16345a19822d",
          "value": 5
        }
      ],
      "id": "48f74b8c-5c53-4003-80c0-101ecd463d54",
      "type": "rating"
    },
    {
      "id": "5e854187-8fdb-4687-96f2-c7f3b5d6fe96",
      "title": "어떤 부분에서 실망하셨나요?",
      "description": "솔직하게 응답해주세요!",
      "type": "multipleChoice",
      "nextStepId": "e23a8126-00d4-429e-a848-2d450542a9d0",
      "options": [
        {
          "id": "dde714d5-ab87-4d3e-9fb8-21a6e7cf9036",
          "value": "비싼 가격"
        },
        {
          "id": "b694e61d-0b72-4594-a378-7e6eb990dd01",
          "value": "안 좋은 CS경험"
        },
        {
          "id": "09b73789-5c71-4059-a57f-ef851abef79c",
          "value": "낮은 성능"
        },
        {
          "id": "9d0e0efb-e561-4353-894a-bb83c55d01eb",
          "value": "못생긴 디자인"
        }
      ]
    },
    {
      "id": "89d47be1-324e-4e8f-ac87-16345a19822d",
      "title": "감사합니다. 여기 추천인 코드가 있어요.",
      "description": "신규가입자가 입력하면 양쪽 모두에게 10%할인이 들어가요 :)",
      "type": "link",
      "nextStepId": "e23a8126-00d4-429e-a848-2d450542a9d0",
      "url": "www.naver.com",
      "buttonText": "코드 받기"
    },
    {
      "id": "a9b709bc-c80c-45c0-bd3d-62798a5838a5",
      "title": "어떤 부분이 개선되었으면 하시나요?",
      "description": "저희가 더 나은 서비스를 제공할 수 있도록 도와주세요.",
      "type": "freeText",
      "nextStepId": ""
    },
    {
      "id": "ddc1de2c-47a7-44b7-82b7-8254f526a219",
      "title": "개인정보 수집동의",
      "description": "다음을 누르시면 개인정보 수집에 동의한 것으로 간주합니다.",
      "type": "info",
      "nextStepId": ""
    },
    {
      "description": "설문조사에 참여해주셔서 감사합니다.",
      "id": "e23a8126-00d4-429e-a848-2d450542a9d0",
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
  "type": "custom",
  "userId": {
    "$oid": "66a9be259b5c77304bee6d0a"
  },
  "createAt": {
    "$date": "2024-07-31T07:06:09.662Z"
  },
  "updateAt": {
    "$date": "2024-08-01T01:29:48.505Z"
  },
  "views": 0
}
좀 더 자세히 설명하자면 설문조사에서 step의 type은 위에서 제시한게 전부이고, trigger같은 경우는 type이 위에서 나온 것만 있는게 아니라 fistVisit, click, exit, scroll이 있어. pageType은 all, specific이 있어. all은 모든 페이지에 적용되는 trigger이고, specific은 특정 페이지에만 적용되는 trigger이야. pageValue는 pageType이 specific일 때만 사용되는데, 이때는 특정 페이지의 url을 써주면 돼. /login처럼 말이야. pageType이 all일 때는 pageValue를 빈 문자열로 써주면 돼.
trigger의 type이 click일 때는 clickType과 clickValue가 있어. clickType은 css, text가 있어. css의 경우 clickValue에는 css selector를 써주면 돼. 클래스의 경우 .클래스명, 아이디의 경우 #아이디명을 넣으주면 돼. text의 경우 clickValue에는 클릭할 텍스트를 써주면 돼.
delay의 경우 delaytype은 once, untilComplete, always가 있어. once의 경우 delayValue로 빈 문자열을 갖고, untilComplete의 경우 밀리세컨드 단위의 시간을 써주면 돼. always의 경우도 마찬가지야.
trigger의 경우 설문조사가 뜨는 조건을 설정하는 거야. 유의해야할게 type이 firstVisit인건 딱히 첫방문이 아니라 그냥 페이지에 접속했을 때로 생각하면 돼. 그리고 delay의 경우에는 응답자들의 피로도를 줄이기 위해 설정하는 거야. once는 trigger가 발동했을 때 한번만 뜨게 하는 거고, untilComplete는 설문조사를 완료할 때까지 뜨게 하는 거야. always는 항상 뜨게 하는 거야.
그런데 delayType이 untilComplete거나 always일 때 설문조사가 너무 많이 떠서 피로할 수 있잖아? 그래서 delayValue를 줘서 설문조사가 뜨는 시간을 조절할 수 있어. delayValue는 밀리세컨드 단위로 써주면 돼. 예를 들어 86400초는 1일이야. 그러니까 trigger를 만족시켜도 1일에 한번씩 뜨게 하려면 delayValue에 86400을 써주면 돼.
유저는 아마 설문조사 문항에 관심이 많을테니까 설문조사 문항에 대한 정리가 어느정도 끝나면 너가 trigger랑 delay에 대한 질문을 던져야해.
그리고 객관식의 경우 option이 여러개 일 때 서로 id가 겹치면 안 돼.


`,
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
    const [conversationPart, jsonPart] = text.split('////')

    // 대화 부분에서 '**' 제거 및 줄바꿈을 <br />로 변환
    const cleanedConversationPart = conversationPart
      .replace(/\*\*/g, '') // '**' 제거
      .replace(/\n/g, '<br />') // 줄바꿈 처리

    // JSON 부분은 줄바꿈을 처리하지 않고 그대로 유지
    const finalText = `${cleanedConversationPart}////${jsonPart || ''}`

    return finalText
  }
}

export default new BackendApis()
