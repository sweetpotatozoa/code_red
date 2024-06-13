;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  let isSurveyOpen = false
  let currentStep = 0
  let surveyResponseId = null
  let surveyResponses = []

  // 고객사 ID 추출
  function getCustomerIdFromUrl() {
    const scriptElements = document.getElementsByTagName('script')
    for (let script of scriptElements) {
      const src = script.src
      const match = src.match(/customerId=([^&]+)/)
      if (match) {
        return match[1]
      }
    }
    return null
  }

  // 설문조사 데이터 가져오기
  async function fetchSurvey(customerId) {
    const response = await fetch(
      `${API_URI}/api/appliedSurvey?customerId=${customerId}`,
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  }

  // 설문조사 응답 제출 (생성)
  async function createResponse(customerId, surveyId, response) {
    const result = await fetch(`${API_URI}/api/appliedSurvey/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, surveyId, ...response }),
    })
    const data = await result.json()
    return data.data._id
  }

  // 설문조사 응답 업데이트
  async function updateResponse(responseId, response) {
    const result = await fetch(
      `${API_URI}/api/appliedSurvey/response/${responseId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      },
    )
    if (!result.ok) {
      throw new Error('Network response was not ok')
    }
    return result.json()
  }

  // 응답 저장
  function saveResponse(stepIndex, response) {
    surveyResponses[stepIndex] = {
      stepIndex,
      response,
    }
  }

  // 설문조사 로드
  function loadSurvey(survey) {
    if (isSurveyOpen) {
      return
    }
    isSurveyOpen = true
    currentStep = 0
    surveyResponses = []

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${API_URI}/survey.css`
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.id = 'survey-popup'
    document.body.appendChild(surveyContainer)

    showStep(survey, currentStep)
    console.log('Survey container created and appended to body')
  }

  // 설문조사 스텝 표시
  function showStep(survey, stepIndex) {
    const step = survey.steps[stepIndex]
    const surveyContainer = document.getElementById('survey-popup')
    const isLastStep = stepIndex === survey.steps.length - 1
    const isSecondToLastStep =
      stepIndex === survey.steps.length - 2 &&
      survey.steps[survey.steps.length - 1].type === 'thankyou'

    let buttonText
    switch (step.type) {
      case 'welcome':
        buttonText = '참여하기'
        break
      case 'thankyou':
        buttonText = ''
        break
      default:
        buttonText = isLastStep || isSecondToLastStep ? '제출하기' : '다음'
    }

    surveyContainer.innerHTML = `
      <div class="survey-step">
        <div class="survey-header">
          <button type="button" id="closeSurvey" class="close-button">X</button>
        </div>
        <form id="surveyForm">
          <label for="question">${step.question}</label>
          <div>
            ${generateStepContent(step)}
          </div>
          ${
            buttonText
              ? `<button type="submit" id="submitSurvey">${buttonText}</button>`
              : ''
          }
        </form>
      </div>
    `

    document.getElementById('closeSurvey').onclick = () => {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey closed')
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const stepResponse = getResponse(step)
      saveResponse(stepIndex, stepResponse)

      if (surveyResponseId) {
        await updateResponse(surveyResponseId, {
          responses: surveyResponses,
        })
      } else {
        surveyResponseId = await createResponse(survey.customerId, survey._id, {
          responses: surveyResponses,
        })
      }

      nextStep(survey, stepIndex)
    }
  }

  // 다음 스텝으로 이동
  function nextStep(survey, stepIndex) {
    if (stepIndex === survey.steps.length - 1) {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey submitted successfully')
    } else {
      currentStep++
      showStep(survey, currentStep)
    }
  }

  // 스텝 콘텐츠 생성
  function generateStepContent(step) {
    switch (step.type) {
      case 'welcome':
        return '' // 웰컴카드에서는 버튼만 제거
      case 'choice':
        return step.options
          .map(
            (option, index) =>
              `<input type="radio" name="choice" value="${option}" id="choice-${index}"><label for="choice-${index}">${option}</label>`,
          )
          .join('')
      case 'rating':
        return `<span class="star-rating">${[1, 2, 3, 4, 5]
          .map(
            (i) =>
              `<input type="radio" name="rating" value="${i}" id="rating-${i}"><label for="rating-${i}">★</label>`,
          )
          .join('')}</span>`
      case 'text':
        return `<textarea name="response" id="response" rows="4" cols="50"></textarea>`
      case 'thankyou':
        return `<div class="thank-you-card"><span class="emoji">😊</span><p>${step.question}</p></div>`
      default:
        return ''
    }
  }

  // 스텝 응답 추출
  function getResponse(step) {
    switch (step.type) {
      case 'welcome':
        return 'clicked'
      case 'choice':
        return document.querySelector('input[name="choice"]:checked').value
      case 'rating':
        return document.querySelector('input[name="rating"]:checked').value
      case 'text':
        return document.getElementById('response').value
      default:
        return ''
    }
  }

  // 트리거 설정
  function setupTriggers(surveys) {
    surveys.forEach((survey) => {
      const trigger = survey.trigger

      if (localStorage.getItem(`survey-${survey._id}`)) {
        return
      }

      const showSurvey = () => {
        loadSurvey(survey)
        localStorage.setItem(`survey-${survey._id}`, 'shown')
      }

      if (trigger.type === 'cssSelector') {
        const button = document.querySelector(trigger.selector)
        if (button) {
          button.addEventListener('click', showSurvey)
        }
      }

      if (trigger.type === 'scroll') {
        window.addEventListener('scroll', () => {
          if (
            window.innerHeight + window.scrollY >=
            document.body.offsetHeight * (trigger.percentage / 100)
          ) {
            showSurvey()
          }
        })
      }

      if (trigger.type === 'exitIntent') {
        document.addEventListener('mouseleave', (event) => {
          if (event.clientY <= 0) {
            showSurvey()
          }
        })
      }

      if (trigger.type === 'newSession') {
        showSurvey()
      }

      if (trigger.type === 'url') {
        if (window.location.pathname === trigger.url) {
          showSurvey()
        }
      }

      if (trigger.type === 'innerText') {
        document.querySelectorAll('button, a, div').forEach((element) => {
          if (element.innerText.includes(trigger.text)) {
            element.addEventListener('click', showSurvey)
          }
        })
      }
    })
    console.log('Triggers set up')
  }

  // 초기화
  async function init() {
    console.log('Initializing survey script')
    const customerId = getCustomerIdFromUrl()
    if (!customerId) {
      throw new Error('Customer ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(customerId)
      setupTriggers(surveyData.data)
      console.log('Survey script initialized')
    } catch (error) {
      console.error('Error fetching survey:', error)
    }
  }

  init()
})()
