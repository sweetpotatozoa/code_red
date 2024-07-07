;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  window.activeSurveyId = null
  let currentStep = 0
  let surveyResponseId = null
  let surveyResponses = []
  let activeSurveys = new Set()
  let surveys = []

  // 1. Helper Functions

  // URL에서 userId 추출
  function getUserIdFromUrl() {
    const scriptElements = document.getElementsByTagName('script')
    for (let script of scriptElements) {
      const src = script.src
      const match = src.match(/userId=([0-9a-fA-F]{24})/)
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
  function saveResponse(step, answer) {
    surveyResponses.push({
      stepId: step.id,
      stepTitle: step.title,
      stepDescription: step.description,
      answer: answer,
      type: step.type,
      timestamp: new Date().toISOString(),
    })
  }

  // HTTP 요청을 통해 설문조사 데이터 가져오기
  async function fetchSurvey(userId) {
    try {
      const response = await fetch(
        `${API_URI}/api/appliedSurvey?userId=${userId}&isDeploy=true`,
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
  async function createResponse(userId, surveyId, answer) {
    try {
      const result = await fetch(`${API_URI}/api/appliedSurvey/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          surveyId,
          answers: [answer],
          createAt: answer.timestamp,
          completeAt: null,
          isComplete: false,
        }),
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
  async function updateResponse(responseId, answers, isComplete) {
    try {
      const result = await fetch(
        `${API_URI}/api/appliedSurvey/response/${responseId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers,
            completeAt: isComplete ? new Date().toISOString() : null,
            isComplete,
          }),
        },
      )
      if (!result.ok) {
        throw new Error(`HTTP error! status: ${result.status}`)
      }

      // updateResponse 호출 시 로컬 스토리지의 completed 값을 true로 변경
      const surveyData = JSON.parse(
        localStorage.getItem(`survey-${window.activeSurveyId}`),
      )
      if (surveyData) {
        surveyData.completed = true
        saveSurveyData(window.activeSurveyId, surveyData)
      }

      return result.json()
    } catch (error) {
      console.error('Error in updateResponse:', error)
      throw error
    }
  }

  // 설문조사 노출 수 카운트
  async function incrementViews(surveyId) {
    try {
      await fetch(`${API_URI}/api/appliedSurvey/${surveyId}/increment-views`, {
        method: 'POST',
      })
      console.log('노출 카운트가 증가되었습니다.')
    } catch (error) {
      console.error('노출 카운트 증가 중 오류 발생:', error)
    }
  }

  // 2. Survey Validation Functions

  // 설문조사 데이터 유효성 검사
  function validateSurvey(survey) {
    if (
      !survey.updateAt ||
      !survey.triggers ||
      !survey.steps ||
      !Array.isArray(survey.steps) ||
      !survey.delay ||
      !survey.delay.delayType ||
      !survey.delay.delayValue
    ) {
      console.error(`Invalid survey structure: ${survey._id}`)
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
        case 'click':
          if (!trigger.clickType || !trigger.clickValue) {
            console.error(
              `Missing clickType or clickValue for click trigger in survey ${survey._id}`,
            )
            return false
          }
          break
        case 'scroll':
        case 'exit':
        case 'firstVisit':
          if (!trigger.pageType || trigger.pageValue === undefined) {
            console.error(
              `Missing pageType or pageValue for ${trigger.type} trigger in survey ${survey._id}`,
            )
            return false
          }
          break
        default:
          console.error(
            `Unknown trigger type: ${trigger.type} in survey ${survey._id}`,
          )
          return false
      }
    }

    for (let step of survey.steps) {
      if (
        !step.id ||
        step.title === undefined ||
        step.description === undefined
      ) {
        console.error(
          `Missing id, title or description in survey ${survey._id}`,
        )
        return false
      }
      switch (step.type) {
        case 'welcome':
        case 'thank':
        case 'multipleChoice':
        case 'link':
        case 'freeText':
        case 'info':
          if (step.nextStepId === undefined) {
            console.error(
              `Missing nextStepId for ${step.type} step in survey ${survey._id}`,
            )
            return false
          }
          break
        case 'singleChoice':
          if (!step.options || !Array.isArray(step.options)) {
            console.error(
              `Invalid options for ${step.type} step in survey ${survey._id}`,
            )
            return false
          }
          for (let option of step.options) {
            if (
              !option.id ||
              !option.value ||
              option.nextStepId === undefined
            ) {
              console.error(`Invalid option structure in survey ${survey._id}`)
              return false
            }
          }
          break
        case 'rating':
          if (!step.options || !Array.isArray(step.options)) {
            console.error(
              `Invalid options for ${step.type} step in survey ${survey._id}`,
            )
            return false
          }
          for (let option of step.options) {
            if (!option.id || option.nextStepId === undefined) {
              console.error(`Invalid option structure in survey ${survey._id}`)
              return false
            }
          }
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

  // 3. Survey Display Functions

  // 설문조사 표시 조건 확인
  function canShowSurvey(survey) {
    const surveyData = getSurveyData(survey._id)
    if (!surveyData) return true

    const { lastShownTime, completed } = surveyData
    const now = new Date()
    const lastShown = new Date(lastShownTime)
    const secondsSinceLastShown = (now - lastShown) / 1000

    switch (survey.delay.delayType) {
      case 'once':
        return false
      case 'untilCompleted':
        if (completed) return false
        return secondsSinceLastShown >= survey.delay.delayValue
      case 'always':
        return secondsSinceLastShown >= survey.delay.delayValue
      default:
        return false
    }
  }

  // 설문조사 스텝 표시
  function showStep(survey, stepIndex) {
    const activeSteps = survey.steps.filter((step) =>
      step.type === 'welcome' || step.type === 'thank' ? step.isActive : true,
    )
    const step = activeSteps[stepIndex]
    const surveyContainer = document.getElementById('survey-popup')

    if (!step) {
      closeSurvey(survey._id, false)
      console.log('Survey finished')
      return
    }

    const buttonText = getButtonText(step)

    surveyContainer.innerHTML = generateStepHTML(step, buttonText)

    document.getElementById('closeSurvey').onclick = () => {
      const isThankStep = step.type === 'thank'
      closeSurvey(survey._id, isThankStep)
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const stepAnswer = getResponse(step)

      if (stepAnswer === null) {
        return
      }

      saveResponse(step, stepAnswer)

      try {
        let isCompleted = false

        if (surveyResponseId) {
          await updateResponse(surveyResponseId, surveyResponses, false)
        } else {
          surveyResponseId = await createResponse(survey.userId, survey._id, {
            ...surveyResponses[0],
          })
        }

        // 링크 스텝 처리
        if (step.type === 'link') {
          window.open(
            step.url.startsWith('http') ? step.url : `https://${step.url}`,
            '_blank',
          )
        }

        // 다음 스텝 인덱스 결정 로직
        let nextStepId
        if (step.type === 'singleChoice' || step.type === 'rating') {
          const selectedOptionId = stepAnswer.id.replace('choice-', '')
          const selectedOption = step.options.find(
            (option) => option.id === selectedOptionId,
          )
          nextStepId = selectedOption ? selectedOption.nextStepId : null
        } else {
          nextStepId = step.nextStepId
        }

        let nextStepIndex
        if (!nextStepId || nextStepId === '') {
          nextStepIndex = stepIndex + 1
        } else {
          nextStepIndex = survey.steps.findIndex((s) => s.id === nextStepId)
          if (nextStepIndex === -1) {
            nextStepIndex = stepIndex + 1
          }
        }

        // 다음 스텝으로 이동 또는 설문조사 완료 처리
        if (nextStepIndex < survey.steps.length) {
          const nextStep = survey.steps[nextStepIndex]

          // thank 스텝으로 넘어갈 때 isComplete를 true로 설정
          if (nextStep.type === 'thank' && nextStep.isActive && !isCompleted) {
            await updateResponse(surveyResponseId, surveyResponses, true)
            isCompleted = true
          }

          currentStep = nextStepIndex
          showStep(survey, currentStep)
        } else {
          const thankStep = survey.steps.find(
            (step) => step.type === 'thank' && step.isActive,
          )
          if (thankStep) {
            currentStep = survey.steps.findIndex(
              (step) => step.id === thankStep.id,
            )
            if (!isCompleted) {
              await updateResponse(surveyResponseId, surveyResponses, true)
              isCompleted = true
            }
            showStep(survey, currentStep)
          } else {
            // thank 스텝이 없거나 active가 아닐 때 isComplete를 true로 설정
            if (!isCompleted) {
              await updateResponse(surveyResponseId, surveyResponses, true)
              isCompleted = true
            }
            closeSurvey(survey._id, true)
            console.log('Survey closed without thank step')
          }
        }
      } catch (error) {
        console.error('Error while submitting survey:', error)
      }
    }

    if (step.type !== 'thank') {
      updateProgressBar(stepIndex, activeSteps.length - 1)
    }
  }

  function generateStepHTML(step, buttonText) {
    return `
      <div class="survey-step">
        <div class="survey-header">
          <button type="button" id="closeSurvey" class="close-button">X</button>
        </div>
        <form id="surveyForm">
          ${
            step.title || step.description
              ? `<div class="step-content">
                  ${step.title ? `<div class="step-title">${step.title}</div>` : ''}
                  ${step.description ? `<div class="step-description">${step.description}</div>` : ''}
                </div>`
              : ''
          }
          <div>
            ${generateStepContent(step)}
          </div>
          ${
            buttonText
              ? `<button type="submit" id="submitSurvey" class="button">${buttonText}</button>`
              : ''
          }
        </form>
      </div>
      ${
        step.type !== 'thank'
          ? `<div class="survey-progress">
              <p class="powered-by">Powered by <strong>Codered</strong></p>
              <div class="progress-bar">
                <div class="progress"></div>
              </div>
            </div>`
          : ''
      }
    `;
}



  function updateProgressBar(currentStepIndex, totalSteps) {
    const progressBar = document.querySelector('.progress')
    if (progressBar) {
      const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100
      progressBar.style.width = `${progressPercentage}%`
    }
  }

  // 설문조사 단계별 버튼 텍스트 설정
  function getButtonText(step) {
    switch (step.type) {
      case 'welcome':
        return '참여하기'
      case 'link':
        return step.buttonText
      case 'thank':
        return ''
      default:
        return '다음'
    }
  }

  // 설문조사 닫기
  function closeSurvey(surveyId, isThankStep = false) {
    const surveyPopup = document.getElementById('survey-popup')
    if (surveyPopup) {
      surveyPopup.remove()
    }
    window.activeSurveyId = null
    console.log('Survey closed')

    window.dispatchEvent(new Event('surveyCompleted'))

    // 서버 응답 업데이트 (isComplete 값은 변경하지 않음)
    if (surveyResponseId) {
      updateResponse(surveyResponseId, surveyResponses, false)
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
              `<input type="radio" name="choice" value="${option.value}" id="choice-${option.id}"><label for="choice-${option.id}">${option.value}</label>`,
          )
          .join('')
      case 'multipleChoice':
        // 다중 선택 질문의 선택지를 체크박스로 렌더링
        return step.options
          .map(
            (option, index) =>
              `<input type="checkbox" name="multipleChoice" value="${option.value}" id="multipleChoice-${option.id}"><label for="multipleChoice-${option.id}">${option.value}</label>`,
          )
          .join('')
      case 'rating':
        // 평점 질문을 별점으로 렌더링
        return `<span class="star-rating">${step.options
          .map(
            (_, index) =>
              `<input type="radio" name="rating" value="${
                index + 1
              }" id="rating-${index}"><label for="rating-${index}">★</label>`,
          )
          .join('')}</span>`
      case 'freeText':
        // 텍스트 입력 질문을 textarea로 렌더링
        return `<textarea name="response" id="response" rows="4" cols="50"></textarea>`
      case 'link':
        return ''
      case 'info':
        return ''
      case 'thank':
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
      case 'singleChoice': {
        const selectedOption = document.querySelector(
          'input[name="choice"]:checked',
        )
        const response = selectedOption
          ? {
              id: selectedOption.id.replace('choice-', ''), // 'choice-' 접두사 제거
              value: selectedOption.value,
            }
          : null
        console.log('SingleChoice response:', response)
        return response
      }
      case 'multipleChoice': {
        const selectedOptions = Array.from(
          document.querySelectorAll('input[name="multipleChoice"]:checked'),
        ).map((checkbox) => ({
          id: checkbox.id.replace('multipleChoice-', ''), // 'multipleChoice-' 접두사 제거
          value: checkbox.value,
        }))
        console.log('MultipleChoice responses:', selectedOptions)
        return selectedOptions.length > 0 ? selectedOptions : null
      }
      case 'rating': {
        const selectedRating = document.querySelector(
          'input[name="rating"]:checked',
        )
        const ratingValue = selectedRating
          ? parseInt(selectedRating.value)
          : null
        const ratingOption = step.options[ratingValue - 1]
        const response = ratingOption
          ? {
              id: ratingOption.id,
              value: ratingValue,
            }
          : null
        console.log('Rating response:', response)
        return response
      }
      case 'freeText': {
        const textResponse = document.getElementById('response')
        console.log(
          'FreeText response:',
          textResponse ? textResponse.value : '',
        )
        return textResponse ? textResponse.value : ''
      }
      case 'link':
        console.log('Link clicked')
        return 'clicked'
      case 'info':
        console.log('Info clicked')
        return 'clicked'
      default:
        return ''
    }
  }

  // 4. Event Listener and Trigger Setup

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

  // 페이지가 특정 URL인지 확인하는 함수
  function isCorrectPage(trigger) {
    if (trigger.pageType === 'all') {
      return true
    } else if (trigger.pageType === 'specific') {
      const currentUrl = new URL(window.location.href)
      return currentUrl.pathname === trigger.pageValue
    }
    return false
  }

  // 트리거 설정 및 처리
  function setupTriggers(surveysData) {
    surveys = surveysData
    const surveyMap = new Map()

    // 트리거 유형별 우선순위 설정
    const triggerPriority = {
      firstVisit: 1,
      url: 2,
      exit: 3,
      scroll: 4,
      click: 5,
    }

    // 각 설문조사의 트리거를 surveyMap에 추가
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

        if (trigger.type === 'click' && isCorrectPage(trigger)) {
          if (trigger.clickType === 'css') {
            const escapedSelector = escapeClassName(trigger.clickValue)
            const button = document.querySelector(escapedSelector)
            if (button) {
              button.addEventListener('click', showSurvey)
              console.log(`Click trigger set for ${trigger.clickValue}`)
              cleanupFunctions.set(escapedSelector, () =>
                button.removeEventListener('click', showSurvey),
              )
            } else {
              console.log(`Click not found: ${trigger.clickValue}`)
            }
          } else if (trigger.clickType === 'text') {
            const elements = document.querySelectorAll('button')
            let found = false
            elements.forEach((element) => {
              if (element.innerText.includes(trigger.clickValue)) {
                const eventListener = function (event) {
                  // 이벤트 타겟이 실제 트리거 조건에 맞는지 확인
                  if (event.target.innerText.includes(trigger.clickValue)) {
                    event.stopPropagation() // 이벤트 버블링 방지
                    showSurvey()
                    console.log(
                      `Inner Text trigger set for ${trigger.clickValue}`,
                    )
                    found = true
                  }
                }
                element.addEventListener('click', eventListener)
                cleanupFunctions.set(element, () =>
                  element.removeEventListener('click', eventListener),
                )
              }
            })
            if (!found) {
              console.log(`Inner Text not found: ${trigger.clickValue}`)
            }
          }
        }

        if (trigger.type === 'exit' && isCorrectPage(trigger)) {
          const handleExitIntent = (event) => {
            console.log('Exit Intent detected')
            if (event.clientY <= 0) {
              showSurvey()
            }
          }
          document.addEventListener('mouseleave', handleExitIntent)
          console.log(`Exit trigger set`)
          cleanupFunctions.set('mouseleave', () =>
            document.removeEventListener('mouseleave', handleExitIntent),
          )
        }

        if (trigger.type === 'firstVisit' && isCorrectPage(trigger)) {
          showSurvey()
          console.log(`First Visit trigger set`)
        }

        if (trigger.type === 'url') {
          setupUrlChangeListener(handleUrlChange)
          handleUrlChange()
          console.log(`URL trigger set for ${trigger.url}`)
        }

        if (trigger.type === 'scroll' && isCorrectPage(trigger)) {
          const handleScroll = () => {
            const scrollPercentage =
              (window.scrollY + window.innerHeight) / document.body.scrollHeight
            console.log(`Scroll Percentage: ${scrollPercentage}`)
            if (scrollPercentage >= 0.01) {
              console.log('Scroll trigger activated')
              showSurvey()
            }
          }
          const debouncedHandleScroll = debounce(handleScroll, 200)
          window.addEventListener('scroll', debouncedHandleScroll)
          console.log(`Scroll trigger set`)
          cleanupFunctions.set('scroll', () =>
            window.removeEventListener('scroll', debouncedHandleScroll),
          )
        }
      })
    } catch (error) {
      console.error('Error in setupTriggers:', error)
    }

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
      cleanupFunctions.clear()
    }
  }

  // 이스케이프 처리 함수 정의
  function escapeClassName(className) {
    return className.replace(/([!"#$%&'()*+,/:;<=>?@[\\\]^`{|}~])/g, '\\$1')
  }

  // 초기화 함수 - 초기화 함수로, 고객 ID를 추출하고 설문조사 데이터를 가져온 후 트리거를 설정합니다.
  async function init() {
    console.log('Initializing survey script')
    const userId = getUserIdFromUrl()
    if (!userId) {
      throw new Error('User ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(userId)
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
    link.onload = async () => {
      const surveyContainer = document.createElement('div')
      surveyContainer.id = 'survey-popup'
      document.body.appendChild(surveyContainer)

      // 노출 카운트 증가 함수 호출
      await incrementViews(survey._id)

      showStep(survey, currentStep)
      console.log('Survey container created and appended to body')

      // 설문조사 시작 시 completed 값을 false로 설정
      saveSurveyData(survey._id, {
        lastShownTime: new Date().toISOString(),
        completed: false,
      })
    }
  }

  // 스크립트 초기화 호출
  init()
})()
