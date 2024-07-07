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
      // 설문조사 데이터 가져오기
      const response = await fetch(
        `${API_URI}/api/appliedSurvey?userId=${userId}&isDeploy=true`,
      )
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Surveys loaded:', data)

      const validSurveys = data.data.filter(validateSurvey)

      // 사용자 데이터에서 surveyPosition 값 가져오기
      const userResponse = await fetch(
        `${API_URI}/api/appliedSurvey/users/${userId}`,
      )
      if (!userResponse.ok) {
        throw new Error('Network response was not ok')
      }
      const userData = await userResponse.json()
      const surveyPosition = userData.surveyPosition

      // 각 설문조사에 surveyPosition 값 설정
      validSurveys.forEach((survey) => {
        survey.position = surveyPosition
      })

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

  function setupRatingStars() {
    const starContainer = document.querySelector('.starInputContainer')
    if (starContainer) {
      const stars = starContainer.querySelectorAll('.starOptionLabel')
      stars.forEach((star, index) => {
        star.addEventListener('click', () => {
          const rating = 5 - index // 역순으로 인덱스 계산
          stars.forEach((s, i) => {
            if (i >= index) {
              s.classList.add('checked')
            } else {
              s.classList.remove('checked')
            }
          })
          // 여기에 선택된 rating 값을 저장하는 로직 추가
        })
      })
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

    const buttonText = step.type === 'thank' ? '닫기' : getButtonText(step)

    surveyContainer.innerHTML = generateStepHTML(step, buttonText)

    document.getElementById('closeSurvey').onclick = () => {
      closeSurvey(survey._id, step.type === 'thank')
    }

    if (step.type === 'singleChoice' || step.type === 'multipleChoice') {
      const optionLabels = document.querySelectorAll('.optionLabel')
      optionLabels.forEach((label) => {
        const input = label.querySelector('input')
        input.addEventListener('change', function () {
          if (step.type === 'singleChoice') {
            optionLabels.forEach((l) => l.classList.remove('checked'))
          }
          if (this.checked) {
            label.classList.add('checked')
          } else {
            label.classList.remove('checked')
          }
        })
      })
    }

    const nextButton = document.getElementById('nextStepButton')
    if (nextButton) {
      if (step.type === 'thank') {
        nextButton.onclick = () => closeSurvey(survey._id, true)
      } else {
        nextButton.onclick = async function (event) {
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
              surveyResponseId = await createResponse(
                survey.userId,
                survey._id,
                {
                  ...surveyResponses[0],
                },
              )
            }

            if (step.type === 'link') {
              window.open(
                step.url.startsWith('http') ? step.url : `https://${step.url}`,
                '_blank',
              )
            }

            let nextStepId
            if (step.type === 'singleChoice' || step.type === 'rating') {
              const selectedOptionId = stepAnswer.id
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

            if (nextStepIndex < survey.steps.length) {
              const nextStep = survey.steps[nextStepIndex]

              if (
                nextStep.type === 'thank' &&
                nextStep.isActive &&
                !isCompleted
              ) {
                await updateResponse(surveyResponseId, surveyResponses, true)
                isCompleted = true
              }

              showStep(survey, nextStepIndex)
            } else {
              const thankStep = survey.steps.find(
                (step) => step.type === 'thank' && step.isActive,
              )
              if (thankStep) {
                const thankStepIndex = survey.steps.findIndex(
                  (step) => step.id === thankStep.id,
                )
                if (!isCompleted) {
                  await updateResponse(surveyResponseId, surveyResponses, true)
                  isCompleted = true
                }
                showStep(survey, thankStepIndex)
              } else {
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
      }
    }

    if (step.type === 'rating') {
      setupRatingStars()
    }

    updateProgressBar(step.id, survey.steps)
  }

  function generateStepHTML(step, buttonText) {
    return `
      <div class="survey-step">
        <div class="survey-header">
          <button type="button" id="closeSurvey" class="close-button">
            <img src="${API_URI}/images/close.png" alt="close" class="close-icon">
          </button>
        </div>
        <div class="content-wrapper">
          <div class="text-content">
            ${step.title ? `<h3 class="survey-title">${step.title}</h3>` : ''}
            ${
              step.description
                ? `<p class="survey-description">${step.description}</p>`
                : ''
            }
          </div>
          <div class="input-content">
            ${generateStepContent(step)}
          </div>
          ${
            buttonText
              ? `<div class="button-container">
                   <button type="button" id="nextStepButton" class="submit-button">${buttonText}</button>
                 </div>`
              : ''
          }
        </div>
        <div class="survey-progress">
            <p class="powered-by">Powered by <span class="logo">CodeRed</span></p>
            <div class="background-bar">
              <div class="progress-bar"></div>
            </div>
          </div>
      </div>
    `
  }

  function updateProgressBar(currentStepId, steps) {
    const progressBar = document.querySelector('.progress-bar')
    if (progressBar) {
      const currentStepIndex = steps.findIndex(
        (step) => step.id === currentStepId,
      )
      const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100
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
      case 'multipleChoice':
        return `
          <div class="inputContainer">
            ${step.options
              .map(
                (option) => `
              <label class="optionLabel">
                <input type="${
                  step.type === 'singleChoice' ? 'radio' : 'checkbox'
                }" 
                       name="${step.type}" 
                       value="${option.value}" 
                       id="${step.type}-${option.id}">
                <span>${option.value}</span>
              </label>
            `,
              )
              .join('')}
          </div>
        `
      case 'rating':
        return `
          <div class="starInputContainer">
            ${[5, 4, 3, 2, 1]
              .map(
                (value) => `
              <label class="starOptionLabel" for="rating-${value}">
                <input type="radio" name="rating" value="${value}" id="rating-${value}">
                <span class="star">&#9733;</span>
              </label>
            `,
              )
              .join('')}
          </div>
        `
      case 'freeText':
        return `<textarea name="response" id="response" rows="4" cols="50"></textarea>`
      case 'link':
      case 'info':
      case 'thank':
        return ''
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
          'input[name="singleChoice"]:checked',
        )
        return selectedOption
          ? {
              id: selectedOption.id.replace('singleChoice-', ''),
              value: selectedOption.value,
            }
          : null
      }
      case 'multipleChoice': {
        const selectedOptions = Array.from(
          document.querySelectorAll('input[name="multipleChoice"]:checked'),
        )
        return selectedOptions.length > 0
          ? selectedOptions.map((option) => ({
              id: option.id.replace('multipleChoice-', ''),
              value: option.value,
            }))
          : null
      }
      case 'rating': {
        const checkedStar = document.querySelector('.starOptionLabel.checked')
        return checkedStar
          ? {
              id: checkedStar.querySelector('input').id.replace('rating-', ''),
              value:
                5 -
                Array.from(checkedStar.parentNode.children).indexOf(
                  checkedStar,
                ),
            }
          : null
      }
      case 'freeText': {
        const textResponse = document.getElementById('response')
        return textResponse ? textResponse.value : ''
      }
      case 'link':
      case 'info':
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

    link.onload = async () => {
      const surveyContainer = document.createElement('div')
      surveyContainer.id = 'survey-popup'
      surveyContainer.classList.add(`survey-popup-position-${survey.position}`) // 이 줄 추가
      document.body.appendChild(surveyContainer)

      await incrementViews(survey._id)

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
