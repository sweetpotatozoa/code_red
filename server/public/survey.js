;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  window.activeSurveyId = null
  let currentStep = 0
  let surveyResponseId = null
  let surveyResponses = []
  let activeSurveys = new Set()
  let surveys = []

  // 1. Helper Functions - 각종 보조 기능을 수행하는 함수들로, URL에서 고객 ID를 추출하거나 로컬 스토리지에 데이터를 저장하고 불러오는 기능을 합니다.

  // URL에서 customerId 추출
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

  // 로컬 스토리지에서 설문조사 데이터를 가져오기
  function getSurveyData(surveyId) {
    const data = localStorage.getItem(`survey-${surveyId}`)
    return data ? JSON.parse(data) : null
  }

  // 로컬 스토리지에 설문조사 데이터 저장
  function saveSurveyData(surveyId, data) {
    localStorage.setItem(`survey-${surveyId}`, JSON.stringify(data))
  }

  // 설문조사 응답을 저장
  function saveResponse(stepIndex, response, type) {
    surveyResponses[stepIndex] = {
      stepIndex,
      response,
      type,
      timestamp: new Date().toISOString(),
    }
  }

  // HTTP 요청을 통해 설문조사 데이터 가져오기
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

      const validSurveys = data.data.filter(validateSurvey)

      return { status: data.status, data: validSurveys }
    } catch (error) {
      console.error('Error fetching survey:', error)
      return null
    }
  }

  // 설문조사 응답 생성
  async function createResponse(customerId, surveyId, response) {
    try {
      const result = await fetch(`${API_URI}/api/appliedSurvey/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId, surveyId, responses: [response] }),
      })
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`)
      }
      const data = await result.json()
      return data.data._id
    } catch (error) {
      console.error('Error in createResponse:', error)
      throw error
    }
  }

  // 설문조사 응답 업데이트
  async function updateResponse(responseId, responses) {
    try {
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
        throw new Error(`HTTP error! status: ${result.status}`)
      }
      return result.json()
    } catch (error) {
      console.error('Error in updateResponse:', error)
      throw error
    }
  }

  // 2. Survey Validation Functions - 설문조사의 데이터 유효성을 검증하는 함수들로, 각 트리거와 스텝이 올바르게 구성되어 있는지 확인합니다.

  // 설문조사 데이터 유효성 검사
  function validateSurvey(survey) {
    if (
      !survey.updateAt ||
      !survey.triggers ||
      !survey.steps ||
      !Array.isArray(survey.steps) ||
      !survey.displayOption
    ) {
      console.error(`Invalid survey structure: ${survey._id}`)
      return false
    }

    if (
      survey.displayOption !== 'once' &&
      (survey.cooldown === undefined || isNaN(survey.cooldown))
    ) {
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
            console.error(
              `Missing selector for cssSelector trigger in survey ${survey._id}`,
            )
            return false
          }
          break
        case 'innerText':
          if (!trigger.text) {
            console.error(
              `Missing text for innerText trigger in survey ${survey._id}`,
            )
            return false
          }
          break
        case 'scroll':
        case 'exitIntent':
        case 'newSession':
          break
        default:
          console.error(
            `Unknown trigger type: ${trigger.type} in survey ${survey._id}`,
          )
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
  }

  // 3. Survey Display Functions - 설문조사를 표시하고, 단계별로 응답을 수집하고 저장하는 함수들로 구성되어 있습니다.

  // 설문조사 표시 조건 확인
  function canShowSurvey(survey) {
    const surveyData = getSurveyData(survey._id)
    if (!surveyData) return true

    const { lastShownTime, completed } = surveyData
    const now = new Date()
    const lastShown = new Date(lastShownTime)
    const secondsSinceLastShown = (now - lastShown) / 1000

    switch (survey.displayOption) {
      case 'once':
        return false
      case 'untilCompleted':
        if (completed) return false
        return secondsSinceLastShown >= survey.cooldown
      case 'always':
        return secondsSinceLastShown >= survey.cooldown
      default:
        return false
    }
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
      window.activeSurveyId = null
      console.log('Survey finished')
      return
    }

    const isLastStep = stepIndex === activeSteps.length - 1
    const isSecondToLastStep =
      stepIndex === activeSteps.length - 2 &&
      activeSteps[activeSteps.length - 1].type === 'thankyou'

    const buttonText = getButtonText(step, isLastStep, isSecondToLastStep)

    surveyContainer.innerHTML = generateStepHTML(step, buttonText)

    document.getElementById('closeSurvey').onclick = () => {
      closeSurvey(survey._id, false)
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const stepResponse = getResponse(step)
      saveResponse(stepIndex, stepResponse, step.type)

      try {
        if (surveyResponseId) {
          await updateResponse(surveyResponseId, surveyResponses)
        } else {
          surveyResponseId = await createResponse(
            survey.customerId,
            survey._id,
            {
              stepIndex,
              response: stepResponse,
              type: step.type,
            },
          )
        }

        if (step.type === 'info') {
          window.open(step.buttonUrl, '_blank')
        }

        nextStep(survey, stepIndex)
      } catch (error) {
        console.error('Error while submitting survey:', error)
      }
    }
  }

  // 설문조사 단계별 내용 생성
  function generateStepHTML(step, buttonText) {
    return `
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
  }

  // 설문조사 단계별 버튼 텍스트 설정
  function getButtonText(step, isLastStep, isSecondToLastStep) {
    switch (step.type) {
      case 'welcome':
        return '참여하기'
      case 'info':
        return step.buttonText
      case 'thankyou':
        return ''
      default:
        return isLastStep || isSecondToLastStep ? '제출하기' : '다음'
    }
  }

  // 설문조사 닫기
  function closeSurvey(surveyId, completed) {
    const surveyPopup = document.getElementById('survey-popup')
    if (surveyPopup) {
      surveyPopup.remove()
    }
    window.activeSurveyId = null
    console.log('Survey closed')
    saveSurveyData(surveyId, {
      lastShownTime: new Date().toISOString(),
      completed,
    })
    window.dispatchEvent(new Event('surveyCompleted')) // 설문조사 완료 이벤트 발생
  }

  // 다음 스텝으로 이동
  function nextStep(survey, stepIndex) {
    const activeSteps = survey.steps.filter((step) =>
      step.type === 'welcome' || step.type === 'thankyou'
        ? step.isActived
        : true,
    )
    if (stepIndex === activeSteps.length - 1) {
      // 마지막 스텝이 "thankyou" 스텝이고 활성화되어 있는 경우
      if (
        activeSteps[stepIndex].type === 'thankyou' &&
        activeSteps[stepIndex].isActived
      ) {
        // "thankyou" 카드에서의 닫기 버튼 클릭 시 completed를 true로 설정
        document.getElementById('closeSurvey').onclick = () => {
          closeSurvey(survey._id, true)
          console.log('Survey submitted successfully')
        }
      } else {
        closeSurvey(survey._id, false)
        console.log('Survey closed')
      }
    } else {
      currentStep++
      showStep(survey, currentStep)
    }
  }

  // 설문조사 스텝 콘텐츠 생성
  function generateStepContent(step) {
    switch (step.type) {
      case 'welcome':
        return ''
      case 'singleChoice':
        // 단일 선택 질문의 선택지를 라디오 버튼으로 렌더링
        return step.options
          .map(
            (option, index) =>
              `<input type="radio" name="choice" value="${option}" id="choice-${index}"><label for="choice-${index}">${option}</label>`,
          )
          .join('')
      case 'multiChoice':
        // 다중 선택 질문의 선택지를 체크박스로 렌더링
        return step.options
          .map(
            (option, index) =>
              `<input type="checkbox" name="multiChoice" value="${option}" id="multiChoice-${index}"><label for="multiChoice-${index}">${option}</label>`,
          )
          .join('')
      case 'rating':
        // 평점 질문을 별점으로 렌더링
        return `<span class="star-rating">${[1, 2, 3, 4, 5]
          .map(
            (i) =>
              `<input type="radio" name="rating" value="${i}" id="rating-${i}"><label for="rating-${i}">★</label>`,
          )
          .join('')}</span>`
      case 'text':
        // 텍스트 입력 질문을 textarea로 렌더링
        return `<textarea name="response" id="response" rows="4" cols="50"></textarea>`
      case 'info':
        return ''
      case 'thankyou':
        // 감사 인사 카드를 이모지와 함께 렌더링
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

  // 4. Event Listener and Trigger Setup - 이벤트 리스너를 설정하고, 각 트리거가 발생할 때 설문조사를 표시하도록 처리하는 함수들입니다. 이벤트 리스너를 제거하는 클린업 함수도 포함되어 있습니다.

  // Debounce 함수
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

  // Debounce와 조건 체크를 포함한 showSurvey 함수
  const showSurvey = debounce((survey) => {
    if (window.activeSurveyId === null && canShowSurvey(survey)) {
      loadSurvey(survey)
    }
  }, 200)

  // URL 변경 감지 함수
  function setupUrlChangeListener(callback) {
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    // history.pushState를 감지
    history.pushState = function () {
      originalPushState.apply(this, arguments)
      callback()
    }

    // history.replaceState를 감지
    history.replaceState = function () {
      originalReplaceState.apply(this, arguments)
      callback()
    }

    // popstate 이벤트를 감지
    window.addEventListener('popstate', callback)
  }

  // URL 트리거를 감지하고 설문조사를 표시하는 함수
  function handleUrlChange() {
    const currentUrl = new URL(window.location.href)
    surveys.forEach((survey) => {
      survey.triggers.forEach((trigger) => {
        if (trigger.type === 'url') {
          const triggerUrl = new URL(trigger.url, window.location.origin)
          if (
            currentUrl.pathname === triggerUrl.pathname ||
            (currentUrl.pathname === '/' && triggerUrl.pathname === '')
          ) {
            showSurvey(survey)
          }
        }
      })
    })
  }

  // 트리거 설정 및 처리
  function setupTriggers(surveysData) {
    surveys = surveysData
    const surveyMap = new Map()

    // 트리거 유형별 우선순위 설정
    const triggerPriority = {
      newSession: 1,
      url: 2,
      exitIntent: 3,
      scroll: 4,
      cssSelector: 5,
      innerText: 6,
    }

    // 각 설문조사의 트리거를 surveyMap에 추가
    // 트리거 유형과 우선순위를 키로 사용하여 설문조사를 그룹화
    // 동일한 트리거를 가진 설문조사 중 가장 최신 업데이트된 설문조사만 남김
    surveys.forEach((survey) => {
      survey.triggers.forEach((trigger) => {
        const key = JSON.stringify({
          ...trigger,
          priority: triggerPriority[trigger.type],
        })
        if (!surveyMap.has(key)) {
          surveyMap.set(key, [survey])
        } else {
          const surveys = surveyMap.get(key)
          const insertIndex = surveys.findIndex(
            (s) => new Date(survey.updateAt) > new Date(s.updateAt),
          )
          if (insertIndex === -1) {
            surveys.push(survey)
          } else {
            surveys.splice(insertIndex, 0, survey)
          }
        }
      })
    })

    // surveyMap의 엔트리를 트리거 우선순위에 따라 정렬
    // 우선순위가 같은 경우, 최신 업데이트된 설문조사가 앞에 오도록 정렬
    const sortedTriggers = Array.from(surveyMap.entries()).sort((a, b) => {
      const triggerA = JSON.parse(a[0])
      const triggerB = JSON.parse(b[0])
      if (triggerA.priority === triggerB.priority) {
        return (
          new Date(surveyMap.get(b[0])[0].updateAt) -
          new Date(surveyMap.get(a[0])[0].updateAt)
        )
      }
      return triggerA.priority - triggerB.priority
    })

    const cleanupFunctions = new Map()

    try {
      sortedTriggers.forEach(([key, surveyList]) => {
        const trigger = JSON.parse(key)

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
            cleanupFunctions.set(trigger.selector, () =>
              button.removeEventListener('click', showSurvey),
            )
          }
        }

        if (trigger.type === 'innerText') {
          document.querySelectorAll('button, a, div').forEach((element) => {
            if (element.innerText.includes(trigger.text)) {
              element.addEventListener('click', showSurvey)
              cleanupFunctions.set(element, () =>
                element.removeEventListener('click', showSurvey),
              )
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
          cleanupFunctions.set('mouseleave', () =>
            document.removeEventListener('mouseleave', handleExitIntent),
          )
        }

        if (trigger.type === 'newSession') {
          showSurvey()
        }

        if (trigger.type === 'url') {
          setupUrlChangeListener(handleUrlChange) // URL 변경 감지 설정
          handleUrlChange() // 초기 URL 체크
        }

        if (trigger.type === 'scroll') {
          const handleScroll = () => {
            const scrollPercentage =
              (window.scrollY + window.innerHeight) / document.body.scrollHeight
            if (scrollPercentage >= 0.01) {
              showSurvey()
            }
          }
          const debouncedHandleScroll = debounce(handleScroll, 200)
          window.addEventListener('scroll', debouncedHandleScroll)

          cleanupFunctions.set('scroll', () =>
            window.removeEventListener('scroll', debouncedHandleScroll),
          )
        }
      })
    } catch (error) {
      console.error('Error in setupTriggers:', error)
    }

    // 정리 함수 반환
    return (surveyId) => {
      cleanupFunctions.forEach((cleanup) => cleanup())
      cleanupFunctions.clear()
    }
  }

  // 초기화 함수 - 초기화 함수로, 고객 ID를 추출하고 설문조사 데이터를 가져온 후 트리거를 설정합니다.
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

        // 페이지 언로드 시 클린업 수행
        window.addEventListener('beforeunload', () =>
          cleanupTriggers(window.activeSurveyId),
        )

        // 설문조사 완료 시 클린업 수행 + 닫기 버튼을 눌러서 완료할 시에도 동작
        function handleSurveyCompletion() {
          cleanupTriggers(window.activeSurveyId)
          window.removeEventListener('surveyCompleted', handleSurveyCompletion)
        }
        window.addEventListener('surveyCompleted', handleSurveyCompletion)

        console.log('Survey script initialized')
      }
    } catch (error) {
      console.error('Error initializing survey script:', error)
    }
  }

  // 설문조사 로드 - 설문조사를 시작하고 첫 번째 스텝을 표시합니다.
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

    // CSS 파일이 로드된 후 설문조사를 표시
    link.onload = () => {
      const surveyContainer = document.createElement('div')
      surveyContainer.id = 'survey-popup'
      document.body.appendChild(surveyContainer)

      showStep(survey, currentStep)
      console.log('Survey container created and appended to body')

      saveSurveyData(survey._id, {
        lastShownTime: new Date().toISOString(),
        completed: false,
      })
    }
  }

  // 스크립트 초기화 호출
  init()
})()
