import React, { useState } from 'react'
import styles from './mermaid.module.css'

const ScoreCalculator = () => {
  const [targetUrl, setTargetUrl] = useState('')

  // 기본 URL의 베이스 부분 설정
  const baseUrl = 'https://www.catchtalk.co.kr'

  // 전체 URL 생성 함수
  const getFullUrl = () => {
    // targetUrl이 비어있을 경우 기본 URL 반환
    if (!targetUrl) return `${baseUrl}/salesmap?utm_source=ad`

    // targetUrl이 '/'로 시작하는지 확인하고 조정
    const formattedPath = targetUrl.startsWith('/')
      ? targetUrl
      : `/${targetUrl}`
    return `${baseUrl}${formattedPath}`
  }

  return (
    <div className={styles.calculatorContainer}>
      <input
        type='text'
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        placeholder='전체 URL을 입력하세요 (예: /salesmap?utm_source=ad)'
        className={styles.input}
      />
      <a href={getFullUrl()} className={styles.button}>
        이동하기
      </a>
    </div>
  )
}

export default ScoreCalculator
