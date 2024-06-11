;(async function () {
  // 스크립트 로드 확인
  console.log('Survey script loaded')

  const API_URI = 'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app'
  let isSurveyOpen = false

  // URL에서 customerId 가져오기
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

  // 설문조사 데이터 가져오기
  async function fetchSurvey(customerId) {
    const response = await fetch(
      `${API_URI}/api/appliedSurvey?customerId=${customerId}`,
    )
    if (!response.ok) {
      throw new Error('Network response was not ok')
    }
    return response.json()
  }

  // 설문조사 응답 제출
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

  // 설문조사 로드
  function loadSurvey(survey) {
    if (isSurveyOpen) {
      return
    }
    isSurveyOpen = true

    console.log('Loading survey') // 설문조사 로드 확인

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href = `${API_URI}/survey.css`
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.innerHTML = `
        <div id="survey-popup">
          <form id="surveyForm">
            <label for="question">${survey.question}</label>
            <div>
              ${
                survey.type === 'rating'
                  ? `<span class="star-rating">
                      ${[1, 2, 3, 4, 5]
                        .map(
                          (i) => `
                          <input type="radio" name="rating" value="${i}" id="rating-${i}">
                          <label for="rating-${i}">★</label>
                        `,
                        )
                        .join('')}
                    </span>`
                  : survey.options
                      .map(
                        (option, index) => `
                        <input type="radio" name="choice" value="${option}" id="choice-${index}">
                        <label for="choice-${index}">${option}</label>
                      `,
                      )
                      .join('')
              }
            </div>
            <button type="submit">제출</button>
            <button type="button" id="closeSurvey">닫기</button>
          </form>
        </div>
      `
    console.log('Survey container created') // 컨테이너 생성 확인

    document.body.appendChild(surveyContainer)
    console.log('Survey container appended to body') // 컨테이너 추가 확인

    document.getElementById('closeSurvey').onclick = () => {
      document.getElementById('survey-popup').remove()
      isSurveyOpen = false
      console.log('Survey closed') // 설문조사 닫기 확인
    }

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const rating = document.querySelector('input[name="rating"]:checked')
      const choice = document.querySelector('input[name="choice"]:checked')
      const data = {
        customerId: survey.customerId,
        question: survey.question,
        response: rating ? '' : choice ? choice.value : '',
        rating: rating ? rating.value : null,
      }
      console.log('Submitting survey') // 제출 데이터 확인

      try {
        const result = await submitSurvey(data)
        if (result && result.status === 201) {
          document.getElementById('survey-popup').style.display = 'none'
          isSurveyOpen = false
          console.log('Survey submitted successfully') // 제출 성공 확인
        } else {
          throw new Error('Network response was not ok')
        }
      } catch (error) {
        console.error('Error submitting survey:', error)
        isSurveyOpen = false
      }
    }
  }

  // 트리거 설정
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

      // 특정 버튼 클릭 시
      if (trigger.type === 'cssSelector') {
        const button = document.querySelector(trigger.selector)
        if (button) {
          button.addEventListener('click', showSurvey)
        }
      }

      // 스크롤 50% 이상 시
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

      // 이탈 감지 시
      if (trigger.type === 'exitIntent') {
        document.addEventListener('mouseleave', (event) => {
          if (event.clientY <= 0) {
            loadSurvey(survey)
            localStorage.setItem(`survey-${survey._id}`, 'shown')
          }
        })
      }

      // 새 세션이 생성되었을 때
      if (trigger.type === 'newSession') {
        showSurvey()
      }

      // 특정 URL을 방문했을 때
      if (trigger.type === 'url') {
        if (window.location.pathname === trigger.url) {
          showSurvey()
        }
      }

      // 특정 텍스트가 포함된 버튼을 클릭했을 때
      if (trigger.type === 'innerText') {
        document.querySelectorAll('button, a, div').forEach((element) => {
          if (element.innerText.includes(trigger.text)) {
            element.addEventListener('click', showSurvey)
          }
        })
      }
    })
    console.log('Triggers set up') // 트리거 설정 확인
  }

  // 스크립트 초기화
  async function init() {
    console.log('Initializing survey script') // 초기화 확인
    const customerId = getCustomerIdFromUrl()
    if (!customerId) {
      throw new Error('Customer ID is not provided in the URL')
    }
    try {
      const surveyData = await fetchSurvey(customerId)
      setupTriggers(surveyData.data) // 트리거 설정
      console.log('Survey script initialized') // 초기화 완료 확인
    } catch (error) {
      console.error('Error fetching survey:', error)
    }
  }

  init()
})()
