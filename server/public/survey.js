;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  window.activeSurveyId = null
  let currentStepId = null
  let selectedTemplate = null
  let isTransitioning = false
  let selectedOptions = []
  let showContainer = true
  let surveys = []
  let surveyResponseId = null;
  let surveyResponses = [];

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
    selectedTemplate = survey;
    currentStepId = survey.steps[stepIndex].id;
    updateUI();
  }


  function updateProgressBar(currentStepIndex, totalSteps) {
    const progressBar = document.querySelector('.progress')
    if (progressBar) {
      const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100
      progressBar.style.width = `${progressPercentage}%`
    }
  }

  function setCurrentStepId(newStepId) {
    currentStepId = newStepId;
  }
  
  function setShowContainer(value) {
    showContainer = value;
  }
  
  function handleOptionChange(option, isMultiple) {
    if (isMultiple) {
      const index = selectedOptions.findIndex(selectedOption => selectedOption.id === option.id);
      if (index !== -1) {
        selectedOptions.splice(index, 1);
      } else {
        selectedOptions.push(option);
      }
    } else {
      selectedOptions = [option];
    }
    updateUI();
  }
  
  async function handleNextStep() {
    if (selectedTemplate && !isTransitioning) {
      const currentStepData = selectedTemplate.steps.find(
        (step) => step.id === currentStepId
      );
  
      if (!currentStepData) return;
  
      const stepAnswer = getResponse(currentStepData);
      if (stepAnswer === null) return;
  
      saveResponse(currentStepData, stepAnswer);
  
      let nextStepId;
  
      if (
        (currentStepData.type === 'singleChoice' ||
          currentStepData.type === 'rating') &&
        selectedOptions.length > 0
      ) {
        nextStepId = selectedOptions[0].nextStepId;
      } else if (currentStepData.type === 'multipleChoice') {
        nextStepId = currentStepData.nextStepId;
      } else if (currentStepData.type !== 'thank') {
        nextStepId = currentStepData.nextStepId;
      }
  
      if (nextStepId) {
        isTransitioning = true;
        
        try {
          if (surveyResponseId) {
            await updateResponse(surveyResponseId, surveyResponses, false);
          } else {
            surveyResponseId = await createResponse(selectedTemplate.userId, selectedTemplate._id, {
              ...surveyResponses[0],
            });
          }
        } catch (error) {
          console.error('Error in handling response:', error);
        }
  
        setTimeout(() => {
          setCurrentStepId(nextStepId);
          selectedOptions = [];
          isTransitioning = false;
          updateUI();
        }, 400);
      } else {
        try {
          await updateResponse(surveyResponseId, surveyResponses, true);
        } catch (error) {
          console.error('Error in finalizing response:', error);
        }
        setShowContainer(false);
        updateUI();
      }
    }
  }
  
  function renderCloseButton() {
    return `
      <div class="closeButton" onclick="setShowContainer(false); updateUI();">
        <img src="/images/close.png" alt="close" />
      </div>
    `;
  }
  
  function renderStepContent(step) {
    if ((step.type === 'welcome' || step.type === 'thank') && !step.isActive) {
      return '';
    }
  
    let content = '';
    switch (step.type) {
      case 'welcome':
      case 'thank':
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
        `;
        break;
      case 'freeText':
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
          <div class="inputContainer">
            <textarea placeholder="Enter text" class="typingBox"></textarea>
          </div>
        `;
        break;
      case 'multipleChoice':
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
          <div class="inputContainer">
            ${step.options.map((option) => `
              <label class="optionLabel ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''}">
                <input type="checkbox" name="option" ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''} 
                  onchange="handleOptionChange({id:'${option.id}', value:'${option.value}'}, true); updateUI();">
                ${option.value}
              </label>
            `).join('')}
          </div>
        `;
        break;
      case 'singleChoice':
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
          <div class="inputContainer">
            ${step.options.map((option) => `
              <label class="optionLabel ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''}">
                <input type="radio" name="option" ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''} 
                  onchange="handleOptionChange({id:'${option.id}', value:'${option.value}'}, false); updateUI();">
                ${option.value}
              </label>
            `).join('')}
          </div>
        `;
        break;
      case 'rating':
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
          <div class="starInputContainer">
            ${step.options.map((option) => `
              <label class="starOptionLabel ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''}">
                <input type="radio" name="rating" value="${option.value}" ${selectedOptions.some(selectedOption => selectedOption.id === option.id) ? 'checked' : ''} 
                  onchange="handleOptionChange({id:'${option.id}', value:'${option.value}'}, false); updateUI();">
                <span class="star">&#9733;</span>
              </label>
            `).join('')}
          </div>
        `;
        break;
      case 'link':
      case 'info':
      default:
        content = `
          <div class="title">${step.title}</div>
          <div class="description">${step.description}</div>
        `;
        break;
    }
    return content;
  }

  function getResponse(step) {
    switch (step.type) {
      case 'welcome':
        return 'clicked';
      case 'singleChoice':
      case 'rating':
        return selectedOptions.length > 0 ? selectedOptions[0] : null;
      case 'multipleChoice':
        return selectedOptions.length > 0 ? selectedOptions : null;
      case 'freeText':
        const textArea = document.querySelector('.typingBox');
        return textArea ? textArea.value : '';
      case 'link':
      case 'info':
        return 'clicked';
      default:
        return '';
    }
  }
  
  function renderButton(step) {
    if (!step) return '';
  
    let buttonContent = '';
    if (step.type === 'welcome') {
      buttonContent = '<div class="button" onclick="handleNextStep()">참여하기</div>';
    } else if (step.type === 'thank') {
      buttonContent = '<div class="button" onclick="handleNextStep()">닫기</div>';
    } else if (step.type === 'link') {
      buttonContent = `<a href="${step.url}" target="_blank"><div class="button" onclick="handleNextStep()">링크로 이동</div></a>`;
    } else {
      buttonContent = '<div class="button" onclick="handleNextStep()">다음</div>';
    }
  
    return buttonContent;
  }
  
  function renderContainer(step) {
    if (!step) return '';
  
    return `
      <div class="container ${step.id === currentStepId ? (isTransitioning ? 'exit' : 'current') : 'next'}">
        ${renderCloseButton()}
        <div class="step">
          ${renderStepContent(step)}
          <div class="buttonContainer">${renderButton(step)}</div>
          <div class="footer">
            <div class="waterMark">
              powered by <span class="logo">CodeRed</span>
            </div>
            <div class="backgroundBar">
              <div class="progressBar" style="width: ${((selectedTemplate.steps.findIndex(s => s.id === step.id) + 1) / selectedTemplate.steps.length) * 100}%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  function updateUI() {
    if (!selectedTemplate || !selectedTemplate.steps || !currentStepId || !showContainer) {
      document.getElementById('survey-popup').innerHTML = '';
      return;
    }
  
    const currentStep = selectedTemplate.steps.find(step => step.id === currentStepId);
  
    let displayStep = currentStep;
    if (currentStep?.type === 'welcome' && !currentStep?.isActive) {
      displayStep = selectedTemplate.steps.find(step => step.id === currentStep.nextStepId);
    }
  
    const nextStepId = displayStep?.nextStepId;
    const nextStep = nextStepId ? selectedTemplate.steps.find(step => step.id === nextStepId) : null;
  
    const content = `
      <div class="previewContainer">
        ${displayStep ? renderContainer(displayStep) : ''}
        ${nextStep ? renderContainer(nextStep) : ''}
      </div>
    `;
  
    document.getElementById('survey-popup').innerHTML = content;
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
      console.log('Another survey is already active');
      return;
    }
    window.activeSurveyId = survey._id;
    currentStepId = survey.steps[0].id;
    selectedOptions = [];
    showContainer = true;
  
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `${API_URI}/survey.css`;
    document.head.appendChild(link);
  
    link.onload = async () => {
      const surveyContainer = document.createElement('div');
      surveyContainer.id = 'survey-popup';
      document.body.appendChild(surveyContainer);
  
      await incrementViews(survey._id);
  
      showStep(survey, 0);
      console.log('Survey container created and appended to body');
  
      saveSurveyData(survey._id, {
        lastShownTime: new Date().toISOString(),
        completed: false,
      });
    };
  }

  // 스크립트 초기화 호출
  init()
})()
