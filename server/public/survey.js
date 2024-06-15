;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  window.activeSurveyId = null
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

  // 설문조사 데이터 유효성 검사 함수
  function validateSurvey(survey) {
    if (!survey.updateAt || !survey.triggers || !survey.steps || !Array.isArray(survey.steps) || !survey.displayOption) {
      console.error(`Invalid survey structure: ${survey._id}`)
      return false
    }

    if (survey.displayOption !== 'once' && (survey.cooldown === undefined || isNaN(survey.cooldown))) {
      console.error(`Missing or invalid cooldown for survey ${survey._id}`)
      return false
    }

    for (let trigger of survey.triggers) {
      if (!trigger.type) {
        console.error(`Missing trigger type in survey ${survey._id}`)
        return false
      }
      switch (trigger.type) {
        case 'url':
          if (trigger.url === undefined) {
            console.error(`Missing url for url trigger in survey ${survey._id}`)
            return false
          }
          break
        case 'cssSelector':
          if (!trigger.selector) {
            console.error(`Missing selector for cssSelector trigger in survey ${survey._id}`)
            return false
          }
          break
        case 'innerText':
          if (!trigger.text) {
            console.error(`Missing text for innerText trigger in survey ${survey._id}`)
            return false
          }
          break
        case 'scroll':
        case 'exitIntent':
        case 'newSession':
          break
        default:
          console.error(`Unknown trigger type: ${trigger.type} in survey ${survey._id}`)
          return false
      }
    }

    for (let step of survey.steps) {
      if (step.title === undefined || step.description === undefined) {
        console.error(`Missing title or description in survey ${survey._id}`)
        return false
      }
      switch (step.type) {
        case 'welcome':
        case 'thankyou':
          if (step.isActived === undefined) {
            console.error(`Missing isActived for ${step.type} step in survey ${survey._id}`)
            return false
          }
          break
        case 'singleChoice':
        case 'multiChoice':
          if (!step.options || !Array.isArray(step.options)) {
            console.error(`Invalid options for ${step.type} step in survey ${survey._id}`)
            return false
          }
          break
        case 'info':
          if (!step.buttonText || !step.buttonUrl) {
            console.error(`Missing buttonText or buttonUrl for info step in survey ${survey._id}`)
            return false
          }
          break
        case 'rating':
        case 'text':
          break
        default:
          console.error(`Unknown step type: ${step.type} in survey ${survey._id}`)
          return false
      }
    }
    return true
  }

  // 설문조사 데이터 가져오기 및 유효성 검사
  async function fetchSurvey(customerId) {
    try {
      const response = await fetch(`${API_URI}/api/appliedSurvey?customerId=${customerId}`)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Surveys loaded:', data)

      const validSurveys = data.data.filter(validateSurvey)

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
    const result = await fetch(`${API_URI}/api/appliedSurvey/response/${responseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    })
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
    if (window.activeSurveyId !== null) {
      console.log('Another survey is already active')
      return
    }
    window.activeSurveyId = survey._id
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

    saveSurveyData(survey._id, { lastShownTime: new Date().toISOString(), completed: false });
  }

  // 설문조사 표시 조건 확인
  function canShowSurvey(survey) {
    const surveyData = getSurveyData(survey._id);
    if (!surveyData) return true;

    const { lastShownTime, completed } = surveyData;
    const now = new Date();
    const lastShown = new Date(lastShownTime);
    const secondsSinceLastShown = (now - lastShown) / 1000;

    switch (survey.displayOption) {
      case 'once':
        return false;
      case 'untilCompleted':
        if (completed) return false;
        return secondsSinceLastShown >= survey.cooldown;
      case 'always':
        return secondsSinceLastShown >= survey.cooldown;
      default:
        return false;
    }
  }

  // 설문조사 스텝 표시
  function showStep(survey, stepIndex) {
    const activeSteps = survey.steps.filter((step) => (step.type === 'welcome' || step.type === 'thankyou') ? step.isActived : true);
    const step = activeSteps[stepIndex];
    const surveyContainer = document.getElementById('survey-popup');

    if (!step) {
      document.getElementById('survey-popup').remove();
      window.activeSurveyId = null;
      console.log('Survey finished');
      return;
    }

    const isLastStep = stepIndex === activeSteps.length - 1;
    const isSecondToLastStep = stepIndex === activeSteps.length - 2 && activeSteps[activeSteps.length - 1].type === 'thankyou';

    const buttonText = getButtonText(step, isLastStep, isSecondToLastStep);

    surveyContainer.innerHTML = generateStepHTML(step, buttonText);

    document.getElementById('closeSurvey').onclick = () => {
      closeSurvey(survey._id, false);
    };

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault();
      const stepResponse = getResponse(step);
      saveResponse(stepIndex, stepResponse, step.type);

      if (surveyResponseId) {
        await updateResponse(surveyResponseId, surveyResponses);
      } else {
        surveyResponseId = await createResponse(survey.customerId, survey._id, {
          stepIndex,
          response: stepResponse,
          type: step.type,
        });
      }

      if (step.type === 'info') {
        window.open(step.buttonUrl, '_blank');
      }

      nextStep(survey, stepIndex);
    };
  }

  function generateStepHTML(step, buttonText) {
    return `
      <div class="survey-step">
        <div class="survey-header">
          <button type="button" id="closeSurvey" class="close-button">X</button>
        </div>
        <form id="surveyForm">
          ${step.title ? `<h3 class="survey-title">${step.title}</h3>` : ''}
          ${step.description ? `<p class="survey-description">${step.description}</p>` : ''}
          <div>
            ${generateStepContent(step)}
          </div>
          ${buttonText ? `<button type="submit" id="submitSurvey">${buttonText}</button>` : ''}
        </form>
      </div>
    `;
  }

  function getButtonText(step, isLastStep, isSecondToLastStep) {
    switch (step.type) {
      case 'welcome':
        return '참여하기';
      case 'info':
        return step.buttonText;
      case 'thankyou':
        return '';
      default:
        return isLastStep || isSecondToLastStep ? '제출하기' : '다음';
    }
  }

  function closeSurvey(surveyId, completed) {
    const surveyPopup = document.getElementById('survey-popup');
    if (surveyPopup) {
      surveyPopup.remove();
    }
    window.activeSurveyId = null;
    console.log('Survey closed');
    saveSurveyData(surveyId, { lastShownTime: new Date().toISOString(), completed });
  }

  function getSurveyData(surveyId) {
    const data = localStorage.getItem(`survey-${surveyId}`);
    return data ? JSON.parse(data) : null;
  }

  function saveSurveyData(surveyId, data) {
    localStorage.setItem(`survey-${surveyId}`, JSON.stringify(data));
  }

  // 다음 스텝으로 이동
  function nextStep(survey, stepIndex) {
    const activeSteps = survey.steps.filter((step) => (step.type === 'welcome' || step.type === 'thankyou') ? step.isActived : true)
    if (stepIndex === activeSteps.length - 1) {
      closeSurvey(survey._id, true)
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
        return ''
      case 'singleChoice':
        return step.options.map((option, index) => `<input type="radio" name="choice" value="${option}" id="choice-${index}"><label for="choice-${index}">${option}</label>`).join('')
      case 'multiChoice':
        return step.options.map((option, index) => `<input type="checkbox" name="multiChoice" value="${option}" id="multiChoice-${index}"><label for="multiChoice-${index}">${option}</label>`).join('')
      case 'rating':
        return `<span class="star-rating">${[1, 2, 3, 4, 5].map((i) => `<input type="radio" name="rating" value="${i}" id="rating-${i}"><label for="rating-${i}">★</label>`).join('')}</span>`
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
        return Array.from(document.querySelectorAll('input[name="multiChoice"]:checked')).map((checkbox) => checkbox.value)
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

  // 페이지 새로고침 또는 닫기 시 설문조사 상태 초기화
  window.addEventListener('beforeunload', () => {
    if (window.activeSurveyId !== null) {
      closeSurvey(window.activeSurveyId, false)
    }
  })

  // 트리거 설정 및 처리
  function setupTriggers(surveys) {
    const surveyMap = new Map()
    const triggerPriority = {
      newSession: 1,
      url: 2,
      exitIntent: 3,
      scroll: 4,
      cssSelector: 5,
      innerText: 6,
    }

    surveys.forEach((survey) => {
      survey.triggers.forEach((trigger) => {
        const key = JSON.stringify({ ...trigger, priority: triggerPriority[trigger.type] })
        if (!surveyMap.has(key) || new Date(survey.updateAt) > new Date(surveyMap.get(key)[0].updateAt)) {
          surveyMap.set(key, [survey])
        } else {
          surveyMap.get(key).push(survey)
        }
      })
    })

    const sortedTriggers = Array.from(surveyMap.entries()).sort((a, b) => {
      const triggerA = JSON.parse(a[0])
      const triggerB = JSON.parse(b[0])
      if (triggerA.priority === triggerB.priority) {
        return new Date(surveyMap.get(b[0])[0].updateAt) - new Date(surveyMap.get(a[0])[0].updateAt)
      }
      return triggerA.priority - triggerB.priority
    })

    function debounce(func, wait) {
      let timeout
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout)
          func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
      }
    }

    const cleanupFunctions = []

    try {
      sortedTriggers.forEach(([key, surveyList]) => {
        const trigger = JSON.parse(key)

        if (!isValidTrigger(trigger)) {
          throw new Error(`Invalid trigger: ${JSON.stringify(trigger)}`)
        }

        // 빠르게 연속된 이벤트 발생 시 마지막 이벤트만 처리
        const showSurvey = debounce(() => {
          for (let survey of surveyList) {
            if (window.activeSurveyId === null && canShowSurvey(survey)) {
              loadSurvey(survey)
              break
            }
          }
        }, 200)

        if (trigger.type === 'cssSelector') {
          const button = document.querySelector(trigger.selector)
          if (button) {
            button.addEventListener('click', showSurvey)
            cleanupFunctions.push(() => button.removeEventListener('click', showSurvey))
          }
        }

        if (trigger.type === 'innerText') {
          document.querySelectorAll('button, a, div').forEach((element) => {
            if (element.innerText.includes(trigger.text)) {
              element.addEventListener('click', showSurvey)
              cleanupFunctions.push(() => element.removeEventListener('click', showSurvey))
            }
          })
        }

        if (trigger.type === 'exitIntent') {
          const handleExitIntent = (event) => {
            if (event.clientY <= 0) {
              showSurvey()
            }
          }
          document.addEventListener('mouseleave', handleExitIntent)
          cleanupFunctions.push(() => document.removeEventListener('mouseleave', handleExitIntent))
        }

        if (trigger.type === 'newSession') {
          showSurvey()
        }

        if (trigger.type === 'url') {
          const currentUrl = new URL(window.location.href)
          const triggerUrl = new URL(trigger.url, window.location.origin)
          if (currentUrl.pathname === triggerUrl.pathname || (currentUrl.pathname === '/' && triggerUrl.pathname === '')) {
            showSurvey()
          }
        }

        if (trigger.type === 'scroll') {
          const handleScroll = () => {
            const scrollPercentage = (window.scrollY + window.innerHeight) / document.body.scrollHeight
            if (scrollPercentage >= 0.01) {
              showSurvey()
            }
          }
          const debouncedHandleScroll = debounce(handleScroll, 200)
          window.addEventListener('scroll', debouncedHandleScroll)

          const cleanup = () => {
            window.removeEventListener('scroll', debouncedHandleScroll)
          }
          cleanupFunctions.push(cleanup)
        }
      })
    } catch (error) {
      console.error('Error in setupTriggers:', error)
    }

    // 정리 함수 반환
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }

  // 초기화 함수
  async function init() {
    console.log('Initializing survey script')
    const customerId = getCustomerIdFromUrl()
    if (!customerId) {
      throw new Error('Customer ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(customerId)
      if (surveyData) {
        const cleanupTriggers = setupTriggers(surveyData.data)

        // SPA 라우트 변경 시 클린업 함수 호출 (예: React Router 사용 시)
        // const history = createBrowserHistory()
        // history.listen(() => {
        //   cleanupTriggers()
        // })

        console.log('Survey script initialized')
      }
    } catch (error) {
      console.error('Error initializing survey script:', error)
    }
  }

  init()
})()
