;(function () {
  console.log('Survey script loaded') // 스크립트 로드 확인

  async function loadSurvey(customerId) {
    const response = await fetch(
      `https://your-server-url/api/appliedSurvey/${customerId}`,
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    const survey = await response.json()

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = 'https://your-server-url/survey.css'
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.innerHTML = generateSurveyHTML(survey)
    document.body.appendChild(surveyContainer)
  }

  function generateSurveyHTML(survey) {
    if (survey.type === 'rating') {
      return `
        <div id="survey-popup">
          <form id="surveyForm">
            <label for="question">${survey.question}</label>
            <div>
              <span class="star-rating">
                ${[1, 2, 3, 4, 5]
                  .map(
                    (i) => `
                    <input type="radio" name="rating" value="${i}" id="rating-${i}">
                    <label for="rating-${i}">★</label>
                  `,
                  )
                  .join('')}
              </span>
            </div>
            <button type="submit">제출</button>
          </form>
        </div>
      `
    } else if (survey.type === 'choice') {
      return `
        <div id="survey-popup">
          <form id="surveyForm">
            <label for="question">${survey.question}</label>
            <div class="choice-container">
              ${survey.options
                .map(
                  (option, index) => `
                  <input type="radio" name="choice" value="${option}" id="choice-${index}">
                  <label for="choice-${index}">${option}</label>
                `,
                )
                .join('')}
            </div>
            <button type="submit">제출</button>
          </form>
        </div>
      `
    }
  }

  async function submitSurvey(responseData) {
    const API_URI = 'https://your-server-url/api/appliedSurvey/response'
    const response = await fetch(API_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(responseData),
    })

    return response.json()
  }

  document.addEventListener('DOMContentLoaded', () => {
    const customerId = 'abcd' // 고객사에서 설정한 고객 ID (추후 동적으로 설정 가능)
    loadSurvey(customerId)

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const surveyData = {
        customerId: customerId,
        surveyId: 'survey_a', // 설문조사 ID를 동적으로 설정해야 함
        answers: [],
      }
      const rating = document.querySelector('input[name="rating"]:checked')
      if (rating) {
        surveyData.answers.push({
          question: '만족도를 평가해주세요',
          answer: rating.value,
        })
      } else {
        const choice = document.querySelector('input[name="choice"]:checked')
        if (choice) {
          surveyData.answers.push({
            question: '제 제품에 만족하시는 이유가 무엇인가요?',
            answer: choice.value,
          })
        }
      }
      try {
        const result = await submitSurvey(surveyData)
        if (result && result.status === 201) {
          alert('설문조사가 성공적으로 제출되었습니다.')
          document.getElementById('survey-popup').style.display = 'none'
        } else {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Error submitting survey:', error)
        alert(
          '설문조사를 제출하는 도중 문제가 발생했습니다. 다시 시도해 주세요.',
        )
      }
    }
  })

  function init() {
    console.log('Initializing survey script') // 초기화 확인
    const customerId = 'abcd' // 고객사에서 설정한 고객 ID (추후 동적으로 설정 가능)
    document.addEventListener('DOMContentLoaded', () => loadSurvey(customerId))
  }

  init()
})()
