import styles from './Delay.module.css'
import { useState } from 'react'

const Delays = ({ survey, setSurvey }) => {
  const [delayType, setDelayType] = useState(survey.delayType || '')
  const [delayValue, setDelayValue] = useState(survey.delayValue || 0)

  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음
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
            onClick={() => setDelayType('once')}
          >
            최초1회
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'untilCompleted' ? styles.selected : ''
            }`}
            onClick={() => setDelayType('untilCompleted')}
          >
            응답할 때 까지
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'always' ? styles.selected : ''
            }`}
            onClick={() => setDelayType('always')}
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
                onClick={() => setDelayValue(1)}
              >
                1일
              </div>
              <div
                className={`${styles.type} ${
                  delayValue === 3 ? styles.selected : ''
                }`}
                onClick={() => setDelayValue(3)}
              >
                3일
              </div>
              <div
                className={`${styles.type} ${
                  delayValue === 7 ? styles.selected : ''
                }`}
                onClick={() => setDelayValue(7)}
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
