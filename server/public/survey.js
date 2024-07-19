;(async function () {
  console.log('CatchTalk script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  window.activeSurveyId = null
  let currentStep = 0
  let surveyResponseId = null
  let surveyResponses = []
  let surveys = []
  const triggeredElements = new WeakMap()

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
            completeAt: isComplete ? new Date() : null,
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
    } catch (error) {
      console.error('노출 카운트 증가 중 오류 발생:', error)
    }
  }

  // 2. Survey Validation Functions

  // 설문조사 데이터 유효성 검사
  function validateSurvey(survey) {
    if (!survey.updateAt) {
      console.error(`Survey ${survey._id}: Missing 'updateAt' field`)
      return false
    }
    if (!Array.isArray(survey.triggers) || survey.triggers.length === 0) {
      console.error(
        `Survey ${survey._id}: 'triggers' must be a non-empty array`,
      )
      return false
    }
    if (!Array.isArray(survey.steps) || survey.steps.length === 0) {
      console.error(`Survey ${survey._id}: 'steps' must be a non-empty array`)
      return false
    }
    if (!survey.delay || !survey.delay.delayType) {
      console.error(`Survey ${survey._id}: Missing 'delay.delayType' field`)
      return false
    }
    if (typeof survey.delay.delayValue !== 'number') {
      console.error(`Survey ${survey._id}: 'delay.delayValue' must be a number`)
      return false
    }

    // Trigger validation remains the same

    for (let step of survey.steps) {
      if (!step.id) {
        console.error(`Survey ${survey._id}: Missing 'id' in step`)
        return false
      }
      if (step.title === undefined) {
        console.error(
          `Survey ${survey._id}: Missing 'title' in step ${step.id}`,
        )
        return false
      }
      if (step.description === undefined) {
        console.error(
          `Survey ${survey._id}: Missing 'description' in step ${step.id}`,
        )
        return false
      }

      switch (step.type) {
        case 'singleChoice':
        case 'rating':
          if (!Array.isArray(step.options)) {
            console.error(
              `Survey ${survey._id}: 'options' must be an array in ${step.type} step ${step.id}`,
            )
            return false
          }
          for (let option of step.options) {
            if (!option.id) {
              console.error(
                `Survey ${survey._id}: Missing 'id' in option of step ${step.id}`,
              )
              return false
            }
            if (option.value === undefined) {
              console.error(
                `Survey ${survey._id}: Missing 'value' in option ${option.id} of step ${step.id}`,
              )
              return false
            }
            if (option.nextStepId === undefined) {
              console.error(
                `Survey ${survey._id}: Missing 'nextStepId' in option ${option.id} of step ${step.id}`,
              )
              return false
            }
          }
          break
        case 'multipleChoice':
          if (!Array.isArray(step.options)) {
            console.error(
              `Survey ${survey._id}: 'options' must be an array in ${step.type} step ${step.id}`,
            )
            return false
          }
          for (let option of step.options) {
            if (!option.id) {
              console.error(
                `Survey ${survey._id}: Missing 'id' in option of step ${step.id}`,
              )
              return false
            }
            if (option.value === undefined) {
              console.error(
                `Survey ${survey._id}: Missing 'value' in option ${option.id} of step ${step.id}`,
              )
              return false
            }
          }
          if (step.nextStepId === undefined) {
            console.error(
              `Survey ${survey._id}: Missing 'nextStepId' in multipleChoice step ${step.id}`,
            )
            return false
          }
          break
        case 'welcome':
        case 'thank':
        case 'link':
        case 'freeText':
        case 'info':
          if (step.nextStepId === undefined) {
            console.error(
              `Survey ${survey._id}: Missing 'nextStepId' in step ${step.id}`,
            )
            return false
          }
          break
        default:
          console.error(
            `Survey ${survey._id}: Unknown step type '${step.type}' in step ${step.id}`,
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
  async function showStep(survey, stepIndex) {
    const activeSteps = survey.steps.filter((step) =>
      step.type === 'welcome' || step.type === 'thank' ? step.isActive : true,
    )
    const step = activeSteps[stepIndex]
    const surveyContainer = document.getElementById('survey-popup')

    if (!step) {
      closeSurvey(survey._id, false)
      return
    }

    surveyContainer.innerHTML = ''
    surveyContainer.appendChild(generateStepHTML(step))

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
              if (step.url) {
                window.open(
                  step.url.startsWith('http')
                    ? step.url
                    : `https://${step.url}`,
                  '_blank',
                )
              } else {
                console.error('링크 URL이 존재하지 않습니다.')
                return
              }
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

            // isComplete 결정 로직
            let isComplete = false
            if (nextStepIndex >= activeSteps.length) {
              // 마지막 스텝 완료
              isComplete = true
            } else {
              const nextStep = survey.steps[nextStepIndex]
              if (nextStep.type === 'thank' && nextStep.isActive) {
                // thank 스텝으로 진입
                isComplete = true
              }
            }

            // isComplete가 true일 때만 updateResponse 호출
            if (isComplete) {
              await updateResponse(surveyResponseId, surveyResponses, true)
            }

            // 다음 스텝으로 이동 또는 설문 종료
            if (nextStepIndex < activeSteps.length) {
              showStep(survey, nextStepIndex)
            } else {
              const thankStep = survey.steps.find(
                (step) => step.type === 'thank' && step.isActive,
              )
              if (thankStep) {
                const thankStepIndex = survey.steps.findIndex(
                  (step) => step.id === thankStep.id,
                )
                showStep(survey, thankStepIndex)
              } else {
                closeSurvey(survey._id, true)
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

  function generateStepHTML(step) {
    const surveyStep = document.createElement('div')
    surveyStep.className = 'survey-step'

    const surveyHeader = document.createElement('div')
    surveyHeader.className = 'survey-header'

    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.id = 'closeSurvey'
    closeButton.className = 'close-button'

    const closeIcon = document.createElement('img')
    closeIcon.src = `${API_URI}/images/close.svg`
    closeIcon.alt = 'close'
    closeIcon.className = 'close-icon'

    closeButton.appendChild(closeIcon)
    surveyHeader.appendChild(closeButton)
    surveyStep.appendChild(surveyHeader)

    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'content-wrapper'

    const textContent = document.createElement('div')
    textContent.className = 'text-content'

    if (step.title) {
      const title = document.createElement('h3')
      title.className = 'survey-title'
      title.textContent = step.title
      textContent.appendChild(title)
    }

    if (step.description) {
      const description = document.createElement('p')
      description.className = 'survey-description'
      description.textContent = step.description
      textContent.appendChild(description)
    }

    contentWrapper.appendChild(textContent)

    const inputContent = document.createElement('div')
    inputContent.className = 'input-content'
    inputContent.innerHTML = generateStepContent(step)
    contentWrapper.appendChild(inputContent)

    const buttonText = getButtonText(step)
    if (buttonText) {
      const buttonContainer = document.createElement('div')
      buttonContainer.className = 'button-container'

      const nextButton = document.createElement('button')
      nextButton.type = 'button'
      nextButton.id = 'nextStepButton'
      nextButton.className = 'submit-button'
      nextButton.textContent = buttonText

      buttonContainer.appendChild(nextButton)
      contentWrapper.appendChild(buttonContainer)
    }

    surveyStep.appendChild(contentWrapper)
    const surveyProgress = document.createElement('div')
    surveyProgress.className = 'survey-progress'

    const poweredBy = document.createElement('p')
    poweredBy.className = 'powered-by'
    poweredBy.innerHTML = 'Powered by <span class="logo">CatchTalk</span>'
    surveyProgress.appendChild(poweredBy)

    const backgroundBar = document.createElement('div')
    backgroundBar.className = 'background-bar'

    const progressBar = document.createElement('div')
    progressBar.className = 'progress-bar'
    backgroundBar.appendChild(progressBar)
    surveyProgress.appendChild(backgroundBar)

    surveyStep.appendChild(surveyProgress)

    return surveyStep.outerHTML
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
        return step.buttonText || '링크로 이동'
      case 'thank':
        return ''
      default:
        return '다음'
    }
  }

  // 설문조사 닫기
  function closeSurvey(surveyId, isComplete = false) {
    const surveyPopup = document.getElementById('survey-popup')
    if (surveyPopup) {
      surveyPopup.remove()
    }
    window.activeSurveyId = null

    window.dispatchEvent(new Event('surveyCompleted'))

    // 서버 응답 업데이트
    if (surveyResponseId) {
      updateResponse(surveyResponseId, surveyResponses, isComplete)
    }
  }

  // 설문조사 스텝 콘텐츠 생성
  function generateStepContent(step) {
    const inputContainer = document.createElement('div')
    inputContainer.className = 'inputContainer'

    switch (step.type) {
      case 'singleChoice':
      case 'multipleChoice':
        step.options.forEach((option) => {
          const label = document.createElement('label')
          label.className = 'optionLabel'

          const input = document.createElement('input')
          input.type = step.type === 'singleChoice' ? 'radio' : 'checkbox'
          input.name = step.type
          input.value = option.value
          input.id = `${step.type}-${option.id}`
          input.onchange = function () {
            label.classList.toggle('checked', input.checked)
          }

          const span = document.createElement('span')
          span.textContent = option.value

          label.appendChild(input)
          label.appendChild(span)
          inputContainer.appendChild(label)
        })
        break
      case 'rating':
        const starContainer = document.createElement('div')
        starContainer.className = 'starInputContainer'
        ;[5, 4, 3, 2, 1].forEach((value) => {
          const label = document.createElement('label')
          label.className = 'starOptionLabel'
          label.htmlFor = `rating-${value}`

          const input = document.createElement('input')
          input.type = 'radio'
          input.name = 'rating'
          input.value = value
          input.id = `rating-${value}`

          const span = document.createElement('span')
          span.className = 'star'
          span.innerHTML = '&#9733;'

          label.appendChild(input)
          label.appendChild(span)
          starContainer.appendChild(label)
        })

        inputContainer.appendChild(starContainer)
        break
      case 'freeText':
        const textarea = document.createElement('textarea')
        textarea.name = 'response'
        textarea.id = 'response'
        textarea.rows = 4
        textarea.cols = 50
        inputContainer.appendChild(textarea)
        break
      case 'welcome':
      case 'link':
      case 'info':
      case 'thank':
        break
      default:
        break
    }

    return inputContainer.innerHTML
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
  const showSurvey = debounce((surveyList) => {
    for (let survey of surveyList) {
      if (window.activeSurveyId === null && canShowSurvey(survey)) {
        loadSurvey(survey)
        break
      }
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
          // #checkConnection 특별 케이스 처리
          if (trigger.url === '#checkConnection') {
            if (currentUrl.hash === '#checkConnection') {
              showSurvey([survey])
            }
            return
          }

          // 일반적인 URL 트리거 처리 (pathname만 비교)
          const triggerUrl = new URL(trigger.url, window.location.origin)
          if (
            currentUrl.pathname === triggerUrl.pathname ||
            (currentUrl.pathname === '/' && triggerUrl.pathname === '')
          ) {
            showSurvey([survey])
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
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.type === 'attributes' &&
            mutation.attributeName === 'class'
          ) {
            checkAndSetupTriggers(
              mutation.target,
              sortedTriggers,
              cleanupFunctions,
            )
          } else if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                checkAndSetupTriggers(node, sortedTriggers, cleanupFunctions)
                node
                  .querySelectorAll('*')
                  .forEach((el) =>
                    checkAndSetupTriggers(el, sortedTriggers, cleanupFunctions),
                  )
              }
            })
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
      })

      // 초기 설정
      document
        .querySelectorAll('*')
        .forEach((el) =>
          checkAndSetupTriggers(el, sortedTriggers, cleanupFunctions),
        )

      sortedTriggers.forEach(([key, surveyList]) => {
        const trigger = JSON.parse(key)

        if (trigger.type === 'exit' && isCorrectPage(trigger)) {
          const handleExitIntent = (event) => {
            if (event.clientY <= 0) {
              showSurvey(surveyList)
            }
          }
          document.addEventListener('mouseleave', handleExitIntent)
          console.log(`Exit trigger set`)
          cleanupFunctions.set('mouseleave', () =>
            document.removeEventListener('mouseleave', handleExitIntent),
          )
        }

        if (trigger.type === 'firstVisit' && isCorrectPage(trigger)) {
          showSurvey(surveyList)
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
            if (scrollPercentage >= 0.01) {
              showSurvey(surveyList)
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
  if (typeof CSS.escape !== 'function') {
    CSS.escape = function (value) {
      return String(value)
        .replace(
          /[\0-\x1F\x7F-\x9F\xA0\xAD\u0600-\u0604\u070F\u17B4\u17B5\u2000-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFF8\uD800-\uF8FF\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
          function (ch) {
            return '\\' + ch.charCodeAt(0).toString(16) + ' '
          },
        )
        .replace(/[\s\S]/g, function (ch) {
          switch (ch) {
            case ' ':
            case '"':
            case '#':
            case '$':
            case '%':
            case '&':
            case "'":
            case '(':
            case ')':
            case '*':
            case '+':
            case ',':
            case '.':
            case '/':
            case ';':
            case '<':
            case '=':
            case '>':
            case '?':
            case '@':
            case '[':
            case '\\':
            case ']':
            case '^':
            case '`':
            case '{':
            case '|':
            case '}':
            case '~':
              return '\\' + ch
            default:
              return ch
          }
        })
    }
  }

  function escapeClassName(selectorString) {
    return selectorString
      .trim()
      .split(/\s+/) // 여러 개의 공백을 하나의 공백으로 줄임
      .map((part) => {
        if (part.startsWith('#')) {
          return '#' + CSS.escape(part.slice(1))
        } else if (part.startsWith('.')) {
          return '.' + CSS.escape(part.slice(1))
        } else {
          return '.' + CSS.escape(part)
        }
      })
      .join('') // 공백 없이 연결
  }

  // 트리거 설정을 확인하고 설정하는 함수
  function checkAndSetupTriggers(element, sortedTriggers, cleanupFunctions) {
    sortedTriggers.forEach(([key, surveyList]) => {
      const trigger = JSON.parse(key)

      if (trigger.type === 'click' && isCorrectPage(trigger)) {
        if (trigger.clickType === 'css') {
          const escapedSelector = escapeClassName(trigger.clickValue)
          // 유효한 선택자인지 확인
          try {
            if (
              element.matches(escapedSelector) &&
              !triggeredElements.has(element)
            ) {
              const clickHandler = () => showSurvey(surveyList)
              element.addEventListener('click', clickHandler)
              triggeredElements.set(element, true)
              console.log(`Click trigger set for ${trigger.clickValue}`)
              cleanupFunctions.set(element, () => {
                element.removeEventListener('click', clickHandler)
                triggeredElements.delete(element)
              })
            }
          } catch (error) {
            console.error(`Invalid selector: ${escapedSelector}`, error)
          }
        } else if (trigger.clickType === 'text') {
          const textNodes = getTextNodes(element)
          textNodes.forEach((textNode) => {
            if (textNode.textContent.trim() === trigger.clickValue) {
              const parentElement = textNode.parentElement
              if (!triggeredElements.has(parentElement)) {
                const eventListener = (event) => {
                  if (event.target.textContent.trim() === trigger.clickValue) {
                    showSurvey(surveyList)
                  }
                }
                parentElement.addEventListener('click', eventListener)
                triggeredElements.set(parentElement, true)
                cleanupFunctions.set(parentElement, () => {
                  parentElement.removeEventListener('click', eventListener)
                  triggeredElements.delete(parentElement)
                })
              }
            }
          })
        }
      }
    })
  }

  // 텍스트 노드를 찾는 헬퍼 함수
  function getTextNodes(element) {
    const textNodes = []
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null,
      false,
    )
    let node
    while ((node = walker.nextNode())) {
      textNodes.push(node)
    }
    return textNodes
  }

  // 초기화 함수 - 초기화 함수로, 고객 ID를 추출하고 설문조사 데이터를 가져온 후 트리거를 설정합니다.
  async function init() {
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
      }
    } catch (error) {
      console.error('Error initializing survey script:', error)
    }
  }

  // 설문조사 로드 - 설문조사를 시작하고 첫 번째 스텝을 표시합니다.
  function loadSurvey(survey) {
    if (window.activeSurveyId !== null) {
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

      saveSurveyData(survey._id, {
        lastShownTime: new Date().toISOString(),
        completed: false,
      })
    }
  }

  // 스크립트 초기화 호출
  init()
})()
