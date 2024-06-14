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

  // 설문조사 데이터 가져오기 및 유효성 검사
  async function fetchSurvey(customerId) {
    try {
      const response = await fetch(
        `${API_URI}/api/appliedSurvey?customerId=${customerId}`,
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Surveys loaded:', data)

      // 유효성 검사 및 필터링
      const validSurveys = data.data.filter((survey) => {
        if (!survey.trigger || !survey.steps || !Array.isArray(survey.steps)) {
          console.error(`Invalid survey structure: ${survey._id}`)
          return false
        }

        // 각 스텝의 유효성 검사
        for (let step of survey.steps) {
          if (step.title === undefined || step.description === undefined) {
            console.error(
              `Missing title or description in survey ${survey._id}`,
            )
            return false
          }

          // 스텝 타입별 필드 검사
          switch (step.type) {
            case 'welcome':
            case 'thankyou':
              if (step.isActived === undefined) {
                console.error(
                  `Missing isActived for ${step.type} step in survey ${survey._id}`,
                )
                return false
              }
              break
            case 'singleChoice':
            case 'multiChoice':
              if (!step.options || !Array.isArray(step.options)) {
                console.error(
                  `Invalid options for ${step.type} step in survey ${survey._id}`,
                )
                return false
              }
              break
            case 'info':
              if (!step.buttonText || !step.buttonUrl) {
                console.error(
                  `Missing buttonText or buttonUrl for info step in survey ${survey._id}`,
                )
                return false
              }
              break
            case 'rating':
            case 'text':
              break
            default:
              console.error(
                `Unknown step type: ${step.type} in survey ${survey._id}`,
              )
              return false
          }
        }
        return true
      })

      return { status: data.status, data: validSurveys }
    } catch (error) {
      console.error('Error fetching survey:', error)
      return null
    }
  }

  // 설문조사 응답 생성
  async function createResponse(customerId, surveyId, response) {
    const result = await fetch(`${API_URI}/api/appliedSurvey/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId, surveyId, responses: [response] }),
    })
    const data = await result.json()
    return data.data._id
  }

  // 설문조사 응답 업데이트
  async function updateResponse(responseId, responses) {
    const result = await fetch(
      `${API_URI}/api/appliedSurvey/response/${responseId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      },
    )
    if (!result.ok) {
      throw new Error('Network response was not ok')
    }
    return result.json()
  }

  // 응답 저장
  function saveResponse(stepIndex, response, type) {
    surveyResponses[stepIndex] = {
      stepIndex,
      response,
      type,
      timestamp: new Date().toISOString(),
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
    const activeSteps = survey.steps.filter((step) =>
      step.type === 'welcome' || step.type === 'thankyou'
        ? step.isActived
        : true,
    )
    const step = activeSteps[stepIndex]
    const surveyContainer = document.getElementById('survey-popup')

    if (!step) {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey finished')
      return
    }

    const isLastStep = stepIndex === activeSteps.length - 1
    const isSecondToLastStep =
      stepIndex === activeSteps.length - 2 &&
      activeSteps[activeSteps.length - 1].type === 'thankyou'

    let buttonText
    switch (step.type) {
      case 'welcome':
        buttonText = '참여하기'
        break
      case 'info':
        buttonText = step.buttonText
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
          ${step.title ? `<h3 class="survey-title">${step.title}</h3>` : ''}
          ${
            step.description
              ? `<p class="survey-description">${step.description}</p>`
              : ''
          }
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

    if (step.type !== 'welcome') {
      document.getElementById('surveyForm').onsubmit = async function (event) {
        event.preventDefault()
        const stepResponse = getResponse(step)
        saveResponse(stepIndex, stepResponse, step.type)

        if (surveyResponseId) {
          await updateResponse(surveyResponseId, surveyResponses)
        } else {
          surveyResponseId = await createResponse(
            survey.customerId,
            survey._id,
            surveyResponses[stepIndex],
          )
        }

        showStep(survey, stepIndex + 1)
      }
    } else {
      document.getElementById('nextStep').onclick = () => {
        saveResponse(stepIndex, 'clicked', step.type)
        showStep(survey, stepIndex + 1)
      }
    }
  }

  // 스텝 콘텐츠 생성
  function generateStepContent(step) {
    switch (step.type) {
      case 'welcome':
        return ''
      case 'singleChoice':
        return step.options
          .map(
            (option, index) =>
              `<input type="radio" name="choice" value="${option}" id="choice-${index}"><label for="choice-${index}">${option}</label>`,
          )
          .join('')
      case 'multiChoice':
        return step.options
          .map(
            (option, index) =>
              `<input type="checkbox" name="multiChoice" value="${option}" id="multiChoice-${index}"><label for="multiChoice-${index}">${option}</label>`,
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
      case 'info':
        return ''
      case 'thankyou':
        return `<div class="thank-you-card"><span class="emoji">😊</span></div>`
      default:
        return ''
    }
  }

  // 응답 추출
  function getResponse(step) {
    switch (step.type) {
      case 'welcome':
        return 'clicked'
      case 'singleChoice':
        return document.querySelector('input[name="choice"]:checked').value
      case 'multiChoice':
        return Array.from(
          document.querySelectorAll('input[name="multiChoice"]:checked'),
        ).map((checkbox) => checkbox.value)
      case 'rating':
        return document.querySelector('input[name="rating"]:checked').value
      case 'text':
        return document.getElementById('response').value
      case 'info':
        return 'clicked'
      default:
        return ''
    }
  }

  // 트리거 설정 및 처리
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

      // 트리거 우선순위 설정
      const triggerPriority = [
        'url',
        'newSession',
        'cssSelector',
        'innerText',
        'exitIntent',
      ]

      triggerPriority.forEach((priority) => {
        if (trigger.type === priority) {
          if (priority === 'cssSelector') {
            const button = document.querySelector(trigger.selector)
            if (button) {
              button.addEventListener('click', showSurvey)
            }
          }

          if (priority === 'innerText') {
            document.querySelectorAll('button, a, div').forEach((element) => {
              if (element.innerText.includes(trigger.text)) {
                element.addEventListener('click', showSurvey)
              }
            })
          }

          if (priority === 'exitIntent') {
            document.addEventListener('mouseleave', (event) => {
              if (event.clientY <= 0) {
                showSurvey()
              }
            })
          }

          if (priority === 'newSession') {
            showSurvey()
          }

          if (priority === 'url') {
            if (window.location.pathname === trigger.url) {
              showSurvey()
            }
          }
        }
      })
    })
    console.log('Triggers set up')
  }

  async function init() {
    console.log('Initializing survey script')
    const customerId = getCustomerIdFromUrl()
    if (!customerId) {
      throw new Error('Customer ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(customerId)
      if (surveyData) {
        setupTriggers(surveyData.data)
        console.log('Survey script initialized')
      }
    } catch (error) {
      console.error('Error initializing survey script:', error)
    }
  }

  init()
})()
