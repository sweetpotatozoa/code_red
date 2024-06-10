;(function () {
  console.log('Survey script loaded')

  async function submitSurvey(data) {
    const API_URI =
      'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app/api/appliedSurvey/choice'
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
    console.log('Loading survey')

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.type = 'text/css'
    link.href =
      'https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app/surveychoice.css'
    document.head.appendChild(link)

    const surveyContainer = document.createElement('div')
    surveyContainer.innerHTML = `
        <div id="survey-popup">
          <form id="surveyForm">
            <label for="question">우리 제품을 통해 무엇을 이루고 싶나요?</label>
            <div>
              <input type="radio" name="answer" value="이탈률을 낮추고 싶어요" id="answer1">
              <label for="answer1">이탈률을 낮추고 싶어요</label><br>
              <input type="radio" name="answer" value="구매 전환율을 높이고 싶어요" id="answer2">
              <label for="answer2">구매 전환율을 높이고 싶어요</label><br>
              <input type="radio" name="answer" value="인터뷰이 모집을 쉽게 하고 싶어요" id="answer3">
              <label for="answer3">인터뷰이 모집을 쉽게 하고 싶어요</label>
            </div>
            <button type="submit">제출</button>
          </form>
        </div>
      `
    console.log('Survey container created', surveyContainer)

    document.body.appendChild(surveyContainer)
    console.log('Survey container appended to body')

    document.getElementById('surveyForm').onsubmit = async function (event) {
      event.preventDefault()
      const answer = document.querySelector('input[name="answer"]:checked')
      if (!answer) {
        alert('Please select an option')
        return
      }
      const data = {
        question: '우리 제품을 통해 무엇을 이루고 싶나요?',
        response: '',
        answer: answer.value,
      }
      console.log('Submitting survey:', data)

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
    console.log('Initializing survey script')
    document.addEventListener('DOMContentLoaded', loadSurvey)
  }

  init()
})()
