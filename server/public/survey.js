;(async function () {
  // 스크립트 로드 확인
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  let isSurveyOpen = false
  let currentStep = 0
  let surveyResponses = []

  // URL에서 customerId 가져오기
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

  // 설문조사 응답 제출
  async function submitSurvey(data) {
    const response = await fetch(`${API_URI}/api/appliedSurvey/response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return response.json()
  }

  // 각 스텝의 응답을 저장
  function saveResponse(surveyId, stepIndex, response) {
    surveyResponses[stepIndex] = {
      surveyId,
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

    console.log('Loading survey') // 설문조사 로드 확인

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${API_URI}/survey.css`
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.id = 'survey-popup'
    document.body.appendChild(surveyContainer)

    showStep(survey, currentStep)
    console.log('Survey container created and appended to body') // 컨테이너 생성 확인
  }

  function showStep(survey, stepIndex) {
    const step = survey.steps[stepIndex]
    const surveyContainer = document.getElementById('survey-popup')
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
          <button type="submit" id="submitSurvey">
            ${stepIndex === survey.steps.length - 1 ? '제출하기' : '다음'}
          </button>
        </form>
      </div>
    `
    document.getElementById('closeSurvey').onclick = () => {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey closed') // 설문조사 닫기 확인
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const response = getResponse(step)
      saveResponse(survey._id, stepIndex, response)

      if (stepIndex === survey.steps.length - 1) {
        try {
          const result = await submitSurvey({
            customerId: survey.customerId,
            responses: surveyResponses,
          })
          if (result && result.status === 201) {
            document.getElementById('survey-popup').remove()
            isSurveyOpen = false
            console.log('Survey submitted successfully') // 제출 성공 확인
          } else {
            throw new Error('Network response was not ok')
          }
        } catch (error) {
          console.error('Error submitting survey:', error)
        }
      } else {
        currentStep++
        showStep(survey, currentStep)
      }
    }
  }

  function generateStepContent(step) {
    switch (step.type) {
      case 'welcome':
        return `<button type="button" id="nextStep">참여하기</button>`
      case 'choice':
        return step.options
          .map(
            (option, index) => `
          <input type="radio" name="choice" value="${option}" id="choice-${index}">
          <label for="choice-${index}">${option}</label>
        `,
          )
          .join('')
      case 'rating':
        return `<span class="star-rating">
          ${[1, 2, 3, 4, 5]
            .map(
              (i) => `
            <input type="radio" name="rating" value="${i}" id="rating-${i}">
            <label for="rating-${i}">★</label>
          `,
            )
            .join('')}
        </span>`
      case 'text':
        return `<textarea name="response" id="response" rows="4" cols="50"></textarea>`
      case 'thankyou':
        return `<button type="button" id="closeSurvey">닫기</button>`
      default:
        return ''
    }
  }

  function getResponse(step) {
    switch (step.type) {
      case 'choice':
        return document.querySelector('input[name="choice"]:checked')?.value
      case 'rating':
        return document.querySelector('input[name="rating"]:checked')?.value
      case 'text':
        return document.getElementById('response').value
      default:
        return null
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
        setTimeout(() => {
          loadSurvey(survey)
          localStorage.setItem(`survey-${survey._id}`, 'shown')
        }, 3000) // 3초 지연
      }

      // 특정 버튼 클릭 시
      if (trigger.type === 'cssSelector') {
        const button = document.querySelector(trigger.selector)
        if (button) {
          button.addEventListener('click', showSurvey)
        }
      }

      // 스크롤 50% 이상 시
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

      // 이탈 감지 시
      if (trigger.type === 'exitIntent') {
        document.addEventListener('mouseleave', (event) => {
          if (event.clientY <= 0) {
            showSurvey()
          }
        })
      }

      // 새 세션이 생성되었을 때
      if (trigger.type === 'newSession') {
        showSurvey() // 단순히 새 세션이 시작될 때 로드
      }

      // 특정 URL을 방문했을 때
      if (trigger.type === 'url') {
        if (window.location.pathname === trigger.url) {
          showSurvey()
        }
      }

      // 특정 텍스트가 포함된 버튼을 클릭했을 때
      if (trigger.type === 'innerText') {
        document.querySelectorAll('button, a, div').forEach((element) => {
          if (element.innerText.includes(trigger.text)) {
            element.addEventListener('click', showSurvey)
          }
        })
      }
    })
    console.log('Triggers set up') // 트리거 설정 확인
  }

  // 스크립트 초기화
  async function init() {
    console.log('Initializing survey script') // 초기화 확인
    const customerId = getCustomerIdFromUrl()
    if (!customerId) {
      throw new Error('Customer ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(customerId)
      setupTriggers(surveyData.data) // 트리거 설정
      console.log('Survey script initialized') // 초기화 완료 확인
    } catch (error) {
      console.error('Error fetching survey:', error)
    }
  }

  init()
})()
