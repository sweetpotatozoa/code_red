import React, { useState } from 'react'
import styles from './mermaid.module.css'

const ScoreCalculator = () => {
  const [targetUrl, setTargetUrl] = useState('')

  return (
    <div className={styles.calculatorContainer}>
      <input
        type='text'
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        placeholder='전체 URL을 입력하세요 (예: /salesmap?utm_source=ad)'
        className={styles.input}
      />
      <a
        href='https://www.catchtalk.co.kr/salesmap?utm_source=ad'
        className={styles.button}
      >
        이동하기
      </a>
    </div>
  )
}

export default ScoreCalculator
