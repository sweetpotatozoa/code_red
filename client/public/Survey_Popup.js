import React, { useState } from 'react'
import BackendApis from '../../utils/backendApis'
import './SurveyPopup.css'

const SurveyPopup = () => {
  const [rating, setRating] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!rating) {
      setError('Please select a rating')
      return
    }
    const data = {
      question: '제품에 만족하시나요?',
      response: '',
      rating,
    }
    try {
      const result = await BackendApis.submitSurvey(data)
      if (result && result.status === 201) {
        alert('설문조사가 성공적으로 제출되었습니다.')
        document.getElementById('survey-popup').style.display = 'none'
      } else {
        throw new Error('Network response was not ok')
      }
    } catch (error) {
      console.error('Error submitting survey:', error)
      setError(
        '설문조사를 제출하는 도중 문제가 발생했습니다. 다시 시도해 주세요.',
      )
    }
  }

  return (
    <div id='survey-popup'>
      <form id='surveyForm' onSubmit={handleSubmit}>
        <label htmlFor='question'>제품에 만족하시나요?</label>
        <div>
          <span className='star-rating'>
            {[1, 2, 3, 4, 5].map((i) => (
              <React.Fragment key={i}>
                <input
                  type='radio'
                  name='rating'
                  value={i}
                  id={`rating-${i}`}
                  onChange={() => setRating(i)}
                />
                <label htmlFor={`rating-${i}`}>★</label>
              </React.Fragment>
            ))}
          </span>
        </div>
        {error && <p className='error'>{error}</p>}
        <button type='submit'>제출</button>
      </form>
    </div>
  )
}

export default SurveyPopup
