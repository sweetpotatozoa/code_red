import React, { useState, useMemo } from 'react'
import styles from './mermaid.module.css'
import { Link, useLocation } from 'react-router-dom'

const ScoreCalculator = () => {
  const [targetUrl, setTargetUrl] = useState('')
  const location = useLocation()

  const linkProps = useMemo(() => {
    if (!targetUrl) {
      return { href: '#', isInternal: true }
    }

    const isInternalLink =
      targetUrl.startsWith('/') || targetUrl.includes('catchtalk.co.kr')

    if (isInternalLink) {
      const path = targetUrl.startsWith('/')
        ? targetUrl
        : new URL(targetUrl).pathname + new URL(targetUrl).search
      return {
        to: path,
        isInternal: true,
        // 현재 경로 정보를 state로 전달
        state: { prevPath: location.pathname + location.search },
      }
    }

    return { href: targetUrl, isInternal: false }
  }, [targetUrl, location])

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
