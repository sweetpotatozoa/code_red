import styles from './Delay.module.css'
import { useState, useEffect } from 'react'

const Delays = ({ survey, setSurvey }) => {
  const [delayType, setDelayType] = useState(survey.delay?.delayType || '')
  const [delayValue, setDelayValue] = useState(survey.delay?.delayValue || 0)

  // 초를 일로 변환하는 함수
  const secondsToDays = (seconds) => {
    return Math.round(seconds / 86400) // 86400초 = 1일
  }

  // 일을 초로 변환하는 함수
  const daysToSeconds = (days) => {
    return days * 86400
  }

  useEffect(() => {
    // 컴포넌트가 마운트되거나 survey가 변경될 때 delayValue를 일 단위로 변환
    setDelayValue(secondsToDays(survey.delay?.delayValue || 0))
  }, [survey])

  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음

  const updateDelay = (type, value) => {
    setDelayType(type)
    const newDelayValueInSeconds = daysToSeconds(value)
    setDelayValue(value)
    setSurvey({
      ...survey,
      delay: {
        ...survey.delay,
        delayType: type,
        delayValue: newDelayValueInSeconds,
      },
    })
  }

  return (
    <div className={styles.delay}>
      <div className={styles.explain}>
        <div className={styles.explainTitle}>발동주기 구성</div>
        <div className={styles.explainContent}>
          설문조사가 뜰 주기를 설정합니다.
        </div>
      </div>
      <div className={styles.delayContent}>
        <div className={styles.explainTitle}>발동주기 유형</div>
        <div className={styles.types}>
          <div
            className={`${styles.type} ${
              delayType === 'once' ? styles.selected : ''
            }`}
            onClick={() => updateDelay('once', delayValue)}
          >
            최초1회
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'untilCompleted' ? styles.selected : ''
            }`}
            onClick={() => updateDelay('untilCompleted', delayValue)}
          >
            응답할 때 까지
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'always' ? styles.selected : ''
            }`}
            onClick={() => updateDelay('always', delayValue)}
          >
            항상
          </div>
        </div>
        {delayType === 'once' && (
          <>
            <div className={styles.explainTitle}>최초 1회</div>
            <div className={styles.explainContent}>
              처음 트리거가 발생했을 때에만 설문조사를 띄우고 응답여부와
              상관없이 다음부터는 띄우지 않습니다.
            </div>
          </>
        )}
        {delayType === 'untilCompleted' && (
          <>
            <div className={styles.explainTitle}>응답할 때 까지</div>
            <div className={styles.explainContent}>
              응답을 받을 때까지 계속해서 설문조사를 띄웁니다.
            </div>
          </>
        )}
        {delayType === 'always' && (
          <>
            <div className={styles.explainTitle}>항상</div>
            <div className={styles.explainContent}>
              응답여부와 상관없이 설문조사를 항상 띄웁니다.
            </div>
          </>
        )}
        {delayType !== 'once' && (
          <>
            <div className={styles.explainTitle}>발동주기 설정</div>
            <div className={styles.types}>
              <div
                className={`${styles.type} ${
                  delayValue === 1 ? styles.selected : ''
                }`}
                onClick={() => updateDelay(delayType, 1)}
              >
                1일
              </div>
              <div
                className={`${styles.type} ${
                  delayValue === 3 ? styles.selected : ''
                }`}
                onClick={() => updateDelay(delayType, 3)}
              >
                3일
              </div>
              <div
                className={`${styles.type} ${
                  delayValue === 7 ? styles.selected : ''
                }`}
                onClick={() => updateDelay(delayType, 7)}
              >
                7일
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Delays
