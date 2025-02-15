import React from 'react'
import styles from './mermaid.module.css'

const ScoreCalculator = () => {
  return (
    <div className={styles.calculatorContainer}>
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
