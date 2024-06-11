;(async function () {
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  let isSurveyOpen = false

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

  async function fetchSurvey(customerId) {
    const response = await fetch(
      `${API_URI}/api/appliedSurvey?customerId=${customerId}`,
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  }

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

  function createStepHtml(question, type, options) {
    let optionsHtml = ''
    if (type === 'rating') {
      optionsHtml = `
        <span class="star-rating">
          ${[1, 2, 3, 4, 5]
            .map(
              (i) => `
              <input type="radio" name="rating" value="${i}" id="rating-${i}">
              <label for="rating-${i}">★</label>
            `,
            )
            .join('')}
        </span>`
    } else {
      optionsHtml = options
        .map(
          (option, index) => `
            <input type="radio" name="choice" value="${option}" id="choice-${index}">
            <label for="choice-${index}">${option}</label>
          `,
        )
        .join('')
    }

    return `
      <div class="survey-step">
        <label for="question">${question}</label>
        <div>${optionsHtml}</div>
      </div>
    `
  }

  function loadSurvey(survey) {
    if (isSurveyOpen) {
      return
    }
    isSurveyOpen = true

    console.log('Loading survey')

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${API_URI}/survey.css`
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.id = 'survey-popup'
    surveyContainer.innerHTML = `
      <form id="surveyForm">
        <div id="survey-steps">
          ${survey.steps
            .map((step) =>
              createStepHtml(step.question, step.type, step.options),
            )
            .join('')}
        </div>
        <button type="button" id="prevStep">Back</button>
        <button type="button" id="nextStep">Next</button>
        <button type="submit" id="submitSurvey">Finish</button>
        <button type="button" id="closeSurvey">Close</button>
      </form>
    `
    document.body.appendChild(surveyContainer)

    let currentStep = 0
    const steps = document.querySelectorAll('.survey-step')
    const prevButton = document.getElementById('prevStep')
    const nextButton = document.getElementById('nextStep')
    const submitButton = document.getElementById('submitSurvey')

    function showStep(stepIndex) {
      steps.forEach((step, index) => {
        step.style.display = index === stepIndex ? 'block' : 'none'
      })
      prevButton.style.display = stepIndex === 0 ? 'none' : 'inline-block'
      nextButton.style.display =
        stepIndex === steps.length - 1 ? 'none' : 'inline-block'
      submitButton.style.display =
        stepIndex === steps.length - 1 ? 'inline-block' : 'none'
    }

    prevButton.onclick = () => {
      if (currentStep > 0) {
        currentStep--
        showStep(currentStep)
      }
    }

    nextButton.onclick = () => {
      if (currentStep < steps.length - 1) {
        currentStep++
        showStep(currentStep)
      }
    }

    showStep(currentStep)

    document.getElementById('closeSurvey').onclick = () => {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey closed')
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const data = {
        customerId: survey.customerId,
        responses: Array.from(steps).map((step, index) => {
          const rating = step.querySelector('input[name="rating"]:checked')
          const choice = step.querySelector('input[name="choice"]:checked')
          return {
            step: index + 1,
            question: step.querySelector('label').innerText,
            response: rating ? '' : choice ? choice.value : '',
            rating: rating ? rating.value : null,
          }
        }),
      }
      console.log('Submitting survey')

      try {
        const result = await submitSurvey(data)
        if (result && result.status === 201) {
          document.getElementById('survey-popup').style.display = 'none'
          isSurveyOpen = false
          console.log('Survey submitted successfully')
        } else {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Error submitting survey:', error)
        isSurveyOpen = false
      }
    }
  }

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
        }, 3000)
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
