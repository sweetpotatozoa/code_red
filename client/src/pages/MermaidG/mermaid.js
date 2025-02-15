import React from 'react'

const ScoreCalculator = () => {
  return (
    <div>
      <button
        onClick={() =>
          (window.location.href = 'https://www.catchtalk.co.kr/salesmap')
        }
      >
        웹폼으로 이동
      </button>
    </div>
  )
}

export default ScoreCalculator
