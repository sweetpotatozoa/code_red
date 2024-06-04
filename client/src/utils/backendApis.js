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

  async getSurveys() {
    return await fetcher('/api/appliedSurvey', this.token, 'GET')
  }

  async submitSurvey(data) {
    return await fetcher('/api/appliedSurvey', this.token, 'POST', data)
  }
}

export default new BackendApis()
