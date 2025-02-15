import React, { useState, useMemo } from 'react'
import styles from './mermaid.module.css'
import { Link } from 'react-router-dom'

const ScoreCalculator = () => {
  const [targetUrl, setTargetUrl] = useState('')

  const linkProps = useMemo(() => {
    if (!targetUrl) {
      return { href: '#', isInternal: true }
    }

    const isInternalLink =
      targetUrl.startsWith('/') || targetUrl.includes('catchtalk.co.kr')

    if (isInternalLink) {
      // 내부 링크인 경우 pathname과 search params 추출
      const path = targetUrl.startsWith('/')
        ? targetUrl
        : new URL(targetUrl).pathname + new URL(targetUrl).search
      return { to: path, isInternal: true }
    }

    // 외부 링크인 경우
    return { href: targetUrl, isInternal: false }
  }, [targetUrl])

  const LinkComponent = linkProps.isInternal ? Link : 'a'

  return (
    <div className={styles.calculatorContainer}>
      <input
        type='text'
        value={targetUrl}
        onChange={(e) => setTargetUrl(e.target.value)}
        placeholder='전체 URL을 입력하세요 (예: /salesmap?utm_source=ad)'
        className={styles.input}
      />
      <LinkComponent
        {...linkProps}
        className={styles.button}
        target={!linkProps.isInternal ? '_blank' : undefined}
        rel={!linkProps.isInternal ? 'noopener noreferrer' : undefined}
      >
        이동하기
      </LinkComponent>
    </div>
  )
}

export default ScoreCalculator
