const API_URI = process.env.REACT_APP_API_URI

const fetcher = async (url, token, method, params = {}) => {
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
    const data = await res.json()
    return data
  } catch (err) {
    return null
  }
}

class BackendApis {
  constructor() {
    this.token = null
  }

  // 로그인
  async login(method = 'POST', params = {}) {
    const result = await fetcher('/api/auth/login', '', method, params)
    if (result?.status === 200) this.token = result.token
    return result
  }

  //소유한 설문조사 목록 가져오기
  async getSurveys(method = 'GET', params = {}) {
    const result = await fetcher('/api/adminSurvey', this.token, method, params)
    return result
  }

  //유저 정보 가져오기
  async getUserInfo(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/userInfo',
      this.token,
      method,
      params,
    )
    return result
  }

  //화면 설정 저장하기
  async editSurveyPosition(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/surveyPosition',
      this.token,
      method,
      params,
    )
    return result
  }

  //설문조사 삭제하기
  async deleteSurvey(surveyId, method = 'DELETE', params = {}) {
    const result = await fetcher(
      `/api/adminSurvey/deleteSurvey/${surveyId}`,
      this.token,
      method,
      params,
    )
    return result
  }

  //설문조사 배포상태 변경하기
  async toggleSurveyDeploy(surveyId, method = 'PUT', params = {}) {
    const result = await fetcher(
      `/api/adminSurvey/toggleSurveyDeploy/${surveyId}`,
      this.token,
      method,
      params,
    )
    return result
  }

  //설문조사 템플릿 가져오기
  async getTemplates(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/adminSurvey/templates',
      this.token,
      method,
      params,
    )
    return result
  }

  async getSurveySummary(surveyId) {
    return await fetcher(`/api/adminSurvey/${surveyId}`, this.token, 'GET')
  }

  async getSurveyQuestions(surveyId) {
    return await fetcher(
      `/api/adminSurvey/${surveyId}/questions`,
      this.token,
      'GET',
    )
  }

  async register(method = 'POST', params = {}) {
    const result = await fetcher('/api/auth/register', '', method, params)
    return result
  }

  async isDeployToggle(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/isDeployToggle',
      this.token,
      method,
      params,
    )
    return result
  }

  async getConnectStatus(method = 'GET', params = {}) {
    const result = await fetcher(
      '/api/connectStatus',
      this.token,
      method,
      params,
    )
    return result
  }

  async createSurvey(method = 'POST', params = {}) {
    const result = await fetcher('/api/templates', this.token, method, params)
    return result
  }

  async editSurvey(method = 'GET', params = {}) {
    const result = await fetcher('/api/edit', this.token, method, params)
    return result
  }

  async updateSurvey(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/surveyUpdate',
      this.token,
      method,
      params,
    )
    return result
  }

  async deploySurvey(method = 'PUT', params = {}) {
    const result = await fetcher(
      '/api/surveyDeploy',
      this.token,
      method,
      params,
    )
    return result
  }

  async getResponse(method = 'GET', params = {}) {
    const result = await fetcher('/api/response', this.token, method, params)
    return result
  }

  async deleteResponse(method = 'DELETE', params = {}) {
    const result = await fetcher('/api/response', this.token, method, params)
    return result
  }

  async downloadResponses(method = 'GET', params = {}) {
    const result = await fetcher('/api/download', this.token, method, params)
    return result
  }
}

export default new BackendApis()
