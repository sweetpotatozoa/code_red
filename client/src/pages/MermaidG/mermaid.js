import React, { useState } from 'react'
import styles from './mermaid.module.css'
import { useNavigate } from 'react-router-dom'

const ScoreCalculator = () => {
  const navigate = useNavigate()
  const [targetUrl, setTargetUrl] = useState('')

  const handleMove = () => {
    if (!targetUrl) return

    // 내부 링크인지 확인 (상대 경로 또는 catchtalk.co.kr 도메인)
    const isInternalLink =
      targetUrl.startsWith('/') || targetUrl.includes('catchtalk.co.kr')

    if (isInternalLink) {
      // 상대 경로로 입력된 경우 처리
      const path = targetUrl.startsWith('/')
        ? targetUrl
        : new URL(targetUrl).pathname + new URL(targetUrl).search
      navigate(path)
    } else {
      // 외부 링크인 경우 전체 URL로 이동
      window.location.href = targetUrl
    }
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
      <button onClick={handleMove}>이동하기</button>
    </div>
  )
}

export default ScoreCalculator
