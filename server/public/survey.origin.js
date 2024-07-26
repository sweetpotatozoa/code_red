;(function () {
  console.log('CatchTalk script loaded')

  // CatchTalk 객체 생성
  window.CatchTalk = {
    activeSurveyId: null,
    currentStep: 0,
    surveyResponseId: null,
    surveyResponses: [],
    surveys: [],
    environmentId: null,
  }

  const triggeredElements = new WeakMap()

  // 1. Helper Functions

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
    CatchTalk.surveyResponses.push({
      stepId: step.id,
      stepTitle: step.title,
      stepDescription: step.description,
      answer: answer,
      type: step.type,
      timestamp: new Date().toISOString(),
    })
  }

  // HTTP 요청을 통해 설문조사 데이터 가져오기
  async function fetchSurvey(environmentId) {
    try {
      // 설문조사 데이터 및 서베이 포지션 값 가져오기
      const [surveyResponse, userResponse] = await Promise.all([
        fetch(
          `${CatchTalk.apiHost}/api/appliedSurvey?userId=${environmentId}&isDeploy=true`,
        ),
        fetch(`${CatchTalk.apiHost}/api/appliedSurvey/users/${environmentId}`),
      ])

      if (!surveyResponse.ok || !userResponse.ok) {
        throw new Error('Network response was not ok')
      }

      const surveyData = await surveyResponse.json()
      const userData = await userResponse.json()
      const validSurveys = surveyData.data.filter(validateSurvey)

      // 각 설문조사에 surveyPosition 값 설정
      validSurveys.forEach((survey) => {
        survey.position = userData.surveyPosition
      })

      return { status: surveyData.status, data: validSurveys }
    } catch (error) {
      console.error('Error fetching survey:', error)
      return null
    }
  }

  // 설문조사 응답 생성
  async function createResponse(environmentId, surveyId, answer) {
    try {
      const result = await fetch(
        `${CatchTalk.apiHost}/api/appliedSurvey/response`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: environmentId,
            surveyId,
            answers: [answer],
            createAt: answer.timestamp,
            completeAt: null,
            isComplete: false,
          }),
        },
      )
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
        `${CatchTalk.apiHost}/api/appliedSurvey/response/${responseId}`,
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
        localStorage.getItem(`survey-${CatchTalk.activeSurveyId}`),
      )
      if (surveyData) {
        surveyData.completed = true
        saveSurveyData(CatchTalk.activeSurveyId, surveyData)
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
      await fetch(
        `${CatchTalk.apiHost}/api/appliedSurvey/${surveyId}/increment-views`,
        {
          method: 'POST',
        },
      )
    } catch (error) {
      console.error('error in incrementViews:', error)
    }
  }

  // CatchTalk 객체에 헬퍼 함수 추가
  Object.assign(CatchTalk, {
    getSurveyData,
    saveSurveyData,
    saveResponse,
    fetchSurvey,
    createResponse,
    updateResponse,
    incrementViews,
  })

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

  // CatchTalk 객체에 유효성 검사 함수 추가
  CatchTalk.validateSurvey = validateSurvey

  // 3. Survey Display Functions

  // 설문조사 표시 조건 확인
  function canShowSurvey(survey) {
    const surveyData = CatchTalk.getSurveyData(survey._id)
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
          const rating = 5 - index
          stars.forEach((s, i) => {
            if (i >= index) {
              s.classList.add('checked')
            } else {
              s.classList.remove('checked')
            }
          })
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
      CatchTalk.closeSurvey(survey._id, false)
      return
    }

    // 기존 HTML을 제거하고 새로 생성된 요소를 추가합니다.
    surveyContainer.innerHTML = ''
    surveyContainer.appendChild(generateStepHTML(step))

    document.getElementById('closeSurvey').onclick = () => {
      CatchTalk.closeSurvey(survey._id, step.type === 'thank')
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
        nextButton.onclick = () => CatchTalk.closeSurvey(survey._id, true)
      } else {
        nextButton.onclick = async function (event) {
          event.preventDefault()
          const stepAnswer = getResponse(step)

          if (stepAnswer === null) {
            return
          }

          CatchTalk.saveResponse(step, stepAnswer)

          try {
            if (CatchTalk.surveyResponseId) {
              await CatchTalk.updateResponse(
                CatchTalk.surveyResponseId,
                CatchTalk.surveyResponses,
                false,
              )
            } else {
              CatchTalk.surveyResponseId = await CatchTalk.createResponse(
                CatchTalk.environmentId,
                survey._id,
                {
                  ...CatchTalk.surveyResponses[0],
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
                console.error('Missing URL in link step')
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

            // 'thank' 스텝의 존재 여부 확인 (활성화 여부와 관계없이)
            const thankStep = survey.steps.find((s) => s.type === 'thank')

            // isComplete 결정 로직
            let isComplete = false
            if (thankStep) {
              if (nextStepId === '' || nextStepId === null) {
                // nextStepId가 비어있거나 null이면, 다음 활성화된 스텝이 'thank'인지 확인
                const currentStepIndex = activeSteps.findIndex(
                  (s) => s.id === step.id,
                )
                const nextActiveStep = activeSteps[currentStepIndex + 1]
                if (nextActiveStep && nextActiveStep.type === 'thank') {
                  isComplete = true
                } else if (!nextActiveStep) {
                  // 다음 활성화된 스텝이 없고, thank 스텝이 존재하면 완료로 간주
                  isComplete = true
                }
              } else if (nextStepId === thankStep.id) {
                // nextStepId가 'thank' 스텝의 id와 일치하면 완료
                isComplete = true
              }
            }

            // 서버에 응답 업데이트
            await CatchTalk.updateResponse(
              CatchTalk.surveyResponseId,
              CatchTalk.surveyResponses,
              isComplete,
            )

            // 다음 스텝으로 이동 또는 설문 종료
            if (nextStepId && nextStepId !== '') {
              const nextStepIndex = activeSteps.findIndex(
                (s) => s.id === nextStepId,
              )
              if (nextStepIndex !== -1) {
                showStep(survey, nextStepIndex)
              } else {
                CatchTalk.closeSurvey(survey._id, isComplete)
              }
            } else {
              const currentStepIndex = activeSteps.findIndex(
                (s) => s.id === step.id,
              )
              if (currentStepIndex < activeSteps.length - 1) {
                showStep(survey, currentStepIndex + 1)
              } else {
                CatchTalk.closeSurvey(survey._id, isComplete)
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

    // Survey Header
    const surveyHeader = document.createElement('div')
    surveyHeader.className = 'survey-header'

    const closeButton = document.createElement('button')
    closeButton.type = 'button'
    closeButton.id = 'closeSurvey'
    closeButton.className = 'close-button'

    const closeIcon = document.createElement('img')
    closeIcon.src = `${CatchTalk.apiHost}/images/close.svg`
    closeIcon.alt = 'close'
    closeIcon.className = 'close-icon'

    closeButton.appendChild(closeIcon)
    surveyHeader.appendChild(closeButton)
    surveyStep.appendChild(surveyHeader)

    // Content Wrapper
    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'content-wrapper'

    const textContent = document.createElement('div')
    textContent.className = 'text-content'

    if (step.title) {
      const title = document.createElement('p')
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

    // Step Content - 직접 contentWrapper에 추가
    const stepContent = generateStepContent(step)
    if (stepContent) {
      contentWrapper.appendChild(stepContent)
    }

    // Button Container
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

    // Survey Progress
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

    return surveyStep
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
        return '닫기'
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
    CatchTalk.activeSurveyId = null

    window.dispatchEvent(new Event('surveyCompleted'))

    // 서버 응답 업데이트
    if (CatchTalk.surveyResponseId) {
      CatchTalk.updateResponse(
        CatchTalk.surveyResponseId,
        CatchTalk.surveyResponses,
        isComplete,
      )
    }
  }

  // 설문조사 스텝 콘텐츠 생성
  function generateStepContent(step) {
    switch (step.type) {
      case 'singleChoice':
      case 'multipleChoice':
        const optionContainer = document.createElement('div')
        optionContainer.className = 'optionContainer'
        step.options.forEach((option) => {
          const label = document.createElement('label')
          label.className = 'optionLabel'
          const input = document.createElement('input')
          input.type = step.type === 'singleChoice' ? 'radio' : 'checkbox'
          input.name = step.type
          input.value = option.value
          input.id = `${step.type}-${option.id}`
          const span = document.createElement('span')
          span.textContent = option.value
          label.appendChild(input)
          label.appendChild(span)
          optionContainer.appendChild(label)
        })
        return optionContainer

      case 'rating':
        const starContainer = document.createElement('div')
        starContainer.className = 'starInputContainer'
        ;[...step.options].reverse().forEach((option) => {
          const label = document.createElement('label')
          label.className = 'starOptionLabel'
          const input = document.createElement('input')
          input.type = 'radio'
          input.name = 'rating'
          input.value = option.value
          input.id = `rating-${option.id}`
          const star = document.createElement('span')
          star.className = 'star'
          star.textContent = '★'
          label.appendChild(input)
          label.appendChild(star)
          starContainer.appendChild(label)
        })
        return starContainer

      case 'freeText':
        const textarea = document.createElement('textarea')
        textarea.name = 'response'
        textarea.id = 'response'
        textarea.rows = 4
        textarea.cols = 50
        textarea.className = 'freeTextArea'
        return textarea

      case 'welcome':
      case 'link':
      case 'info':
      case 'thank':
        return null

      default:
        return null
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

  // CatchTalk 객체에 설문조사 표시 관련 함수들 추가
  Object.assign(CatchTalk, {
    canShowSurvey,
    showStep,
    closeSurvey,
    generateStepHTML,
    updateProgressBar,
    getButtonText,
    generateStepContent,
    getResponse,
  })

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
      if (
        CatchTalk.activeSurveyId === null &&
        CatchTalk.canShowSurvey(survey)
      ) {
        CatchTalk.loadSurvey(survey)
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

  // 페이지가 특정 URL인지 확인하는 함수
  function isCorrectPage(trigger) {
    if (trigger.pageType === 'all') {
      return true
    } else if (trigger.pageType === 'specific') {
      const currentPath = window.location.pathname
      const currentHash = window.location.hash

      if (trigger.pageValue === '#checkConnection') {
        return currentHash === '#checkConnection'
      }

      return (
        currentPath === trigger.pageValue ||
        (currentPath === '/' && trigger.pageValue === '')
      )
    }
    return false
  }

  function setupTriggerForType(trigger, surveyList, cleanupFunctions) {
    switch (trigger.type) {
      case 'scroll':
        const handleScroll = () => {
          const scrollPercentage =
            (window.scrollY + window.innerHeight) / document.body.scrollHeight
          if (scrollPercentage >= 0.01) {
            showSurvey(surveyList)
          }
        }
        const debouncedHandleScroll = debounce(handleScroll, 200)
        window.addEventListener('scroll', debouncedHandleScroll)
        console.log(`Scroll trigger set for ${window.location.pathname}`)
        cleanupFunctions.set('scroll', () =>
          window.removeEventListener('scroll', debouncedHandleScroll),
        )
        break
      case 'exit':
        const handleExitIntent = (event) => {
          if (event.clientY <= 0) {
            showSurvey(surveyList)
          }
        }
        document.addEventListener('mouseleave', handleExitIntent)
        console.log(`Exit trigger set for ${window.location.pathname}`)
        cleanupFunctions.set('exit', () =>
          document.removeEventListener('mouseleave', handleExitIntent),
        )
        break
      case 'click':
        if (trigger.clickType === 'css') {
          const escapedSelector = escapeClassName(trigger.clickValue)
          setupClickObserver(escapedSelector, surveyList, cleanupFunctions)
        } else if (trigger.clickType === 'text') {
          const textNodes = getTextNodes(document.body)
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
        break
      case 'firstVisit':
        if (isCorrectPage(trigger)) {
          if (
            trigger.pageValue === '#checkConnection' &&
            window.location.hash === '#checkConnection'
          ) {
            showSurvey(surveyList)
          } else if (trigger.pageValue !== '#checkConnection') {
            showSurvey(surveyList)
          }
          console.log(
            `First Visit trigger set for ${trigger.pageValue || 'all pages'}`,
          )
        }
        break
      default:
        console.error(`Unknown trigger type: ${trigger.type}`)
    }
  }

  function setupClickObserver(selector, surveyList, cleanupFunctions) {
    // 페이지 로드 시 즉시 트리거 설정
    const setupClickHandler = (element) => {
      if (!triggeredElements.has(element)) {
        const clickHandler = () => showSurvey(surveyList)
        element.addEventListener('click', clickHandler)
        triggeredElements.set(element, true)
        console.log(`Click trigger set for ${selector}`)
        cleanupFunctions.set(element, () => {
          element.removeEventListener('click', clickHandler)
          triggeredElements.delete(element)
        })
      }
    }

    // 초기 설정
    document.querySelectorAll(selector).forEach(setupClickHandler)

    // MutationObserver 설정
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // 새로 추가된 요소에 대해 처리
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE && node.matches(selector)) {
              setupClickHandler(node)
            }
          })
        } else if (mutation.type === 'attributes') {
          // 속성 변경된 요소에 대해 처리
          if (mutation.target.matches(selector)) {
            setupClickHandler(mutation.target)
          }
        }
      })
    })

    const config = {
      attributes: true,
      childList: true,
      subtree: true,
    }
    observer.observe(document.body, config)

    cleanupFunctions.set('clickObserver', () => observer.disconnect())
  }

  // 트리거 설정 및 처리
  function setupTriggers(surveysData) {
    CatchTalk.surveys = surveysData
    const surveyMap = new Map()

    // 트리거 유형별 우선순위 설정
    const triggerPriority = {
      firstVisit: 1,
      exit: 2,
      scroll: 3,
      click: 4,
    }

    // 각 설문조사의 트리거를 surveyMap에 추가
    CatchTalk.surveys.forEach((survey) => {
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

    function setupPageSpecificTriggers() {
      sortedTriggers.forEach(([key, surveyList]) => {
        const trigger = JSON.parse(key)
        if (isCorrectPage(trigger)) {
          setupTriggerForType(trigger, surveyList, cleanupFunctions)
        }
      })
    }

    // 초기 설정
    setupPageSpecificTriggers()

    // URL 변경 감지 및 트리거 재설정
    setupUrlChangeListener(() => {
      // 기존 트리거 정리
      cleanupFunctions.forEach((cleanup) => cleanup())
      cleanupFunctions.clear()

      // 새 URL에 맞는 트리거 재설정
      setupPageSpecificTriggers()
    })

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

  // 설문조사 로드 - 설문조사를 시작하고 첫 번째 스텝을 표시합니다.
  function loadSurvey(survey) {
    if (CatchTalk.activeSurveyId !== null) {
      return
    }
    CatchTalk.activeSurveyId = survey._id
    CatchTalk.currentStep = 0
    CatchTalk.surveyResponses = []

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${CatchTalk.apiHost}/survey.css`
    document.head.appendChild(link)

    link.onload = async () => {
      const surveyContainer = document.createElement('div')
      surveyContainer.id = 'survey-popup'
      surveyContainer.classList.add(`survey-popup-position-${survey.position}`)
      document.body.appendChild(surveyContainer)

      await CatchTalk.incrementViews(survey._id)

      CatchTalk.showStep(survey, CatchTalk.currentStep)

      CatchTalk.saveSurveyData(survey._id, {
        lastShownTime: new Date().toISOString(),
        completed: false,
      })
    }
  }

  // CatchTalk 객체에 트리거 및 초기화 관련 함수들 추가
  Object.assign(CatchTalk, {
    setupTriggers,
    loadSurvey,
    isCorrectPage,
  })

  // 초기화 함수
  CatchTalk.init = async function (config) {
    if (!config || !config.environmentId) {
      throw new Error('Environment ID is required in the configuration')
    }

    CatchTalk.environmentId = config.environmentId
    CatchTalk.apiHost = config.apiHost

    try {
      const surveyData = await CatchTalk.fetchSurvey(CatchTalk.environmentId)
      if (surveyData) {
        const cleanupTriggers = CatchTalk.setupTriggers(surveyData.data)

        // 페이지 언로드 시 클린업 수행
        window.addEventListener('beforeunload', () =>
          cleanupTriggers(CatchTalk.activeSurveyId),
        )

        // 설문조사 완료 시 클린업 수행 + 닫기 버튼을 눌러서 완료할 시에도 동작
        function handleSurveyCompletion() {
          cleanupTriggers(CatchTalk.activeSurveyId)
          window.removeEventListener('surveyCompleted', handleSurveyCompletion)
        }
        window.addEventListener('surveyCompleted', handleSurveyCompletion)
      }
    } catch (error) {
      console.error('Error initializing survey script:', error)
    }
  }

  // 스크립트 로드 완료 후 실행되는 코드
  if (document.readyState === 'complete') {
    console.log('CatchTalk script is ready to be initialized')
  } else {
    window.addEventListener('load', function () {
      console.log('CatchTalk script is ready to be initialized')
    })
  }
})()
