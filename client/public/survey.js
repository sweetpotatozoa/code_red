;(function () {
  console.log('Survey script loaded') // 스크립트 로드 확인

  async function submitSurvey(data) {
    const API_URI = 'https://your-server-address/api/appliedSurvey'
    const response = await fetch(API_URI, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    return response.json()
  }

  function loadSurvey() {
    console.log('Loading survey') // 설문조사 로드 확인

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = 'https://your-server-address/SurveyPopup.css'
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.innerHTML = `
          <div id="survey-popup">
            <form id="surveyForm">
              <label for="question">제품에 만족하시나요?</label>
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
    console.log('Survey container created', surveyContainer) // 컨테이너 생성 확인

    document.body.appendChild(surveyContainer)
    console.log('Survey container appended to body') // 컨테이너 추가 확인

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const rating = document.querySelector('input[name="rating"]:checked')
      if (!rating) {
        alert('Please select a rating')
        return
      }
      const data = {
        question: '제품에 만족하시나요?',
        response: '',
        rating: rating.value,
      }
      console.log('Submitting survey:', data) // 제출 데이터 확인

      try {
        const result = await submitSurvey(data)
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
  }

  function init() {
    console.log('Initializing survey script') // 초기화 확인
    document.addEventListener('DOMContentLoaded', loadSurvey)
  }

  init()
})()
