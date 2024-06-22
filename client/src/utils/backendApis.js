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

  async login(method = 'POST', params = {}) {
    const result = await fetcher('/login', '', method, params)
    if (result?.status === 200) this.token = result.token
    return result
  }

  async getSurveySummary(surveyId) {
    return await fetcher(`/api/summary/${surveyId}`, this.token, 'GET')
  }

  async getSurveyQuestions(surveyId) {
    return await fetcher(
      `/api/summary/${surveyId}/questions`,
      this.token,
      'GET',
    )
  }
}

export default new BackendApis()
