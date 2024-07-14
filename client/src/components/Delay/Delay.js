import styles from './Delay.module.css'
import { useState, useEffect } from 'react'

const Delays = ({ survey, setSurvey }) => {
  const [delayType, setDelayType] = useState(survey.delay?.delayType || '')
  const [delayDays, setDelayDays] = useState('')
  const [delayHours, setDelayHours] = useState('')
  const [delayMinutes, setDelayMinutes] = useState('')
  const [delaySeconds, setDelaySeconds] = useState('')

  useEffect(() => {
    if (survey.delay?.delayValue) {
      const totalSeconds = survey.delay.delayValue
      setDelayDays(Math.floor(totalSeconds / 86400).toString())
      setDelayHours(Math.floor((totalSeconds % 86400) / 3600).toString())
      setDelayMinutes(Math.floor((totalSeconds % 3600) / 60).toString())
      setDelaySeconds((totalSeconds % 60).toString())
    }
  }, [survey])

  useEffect(() => {
    const totalSeconds =
      (parseInt(delayDays, 10) || 0) * 86400 +
      (parseInt(delayHours, 10) || 0) * 3600 +
      (parseInt(delayMinutes, 10) || 0) * 60 +
      (parseInt(delaySeconds, 10) || 0)
    setSurvey({
      ...survey,
      delay: {
        ...survey.delay,
        delayType: delayType,
        delayValue: totalSeconds,
      },
    })
  }, [delayDays, delayHours, delayMinutes, delaySeconds, delayType])

  if (!survey) return null

  const handleDaysChange = (e) => {
    setDelayDays(e.target.value)
  }

  const handleHoursChange = (e) => {
    setDelayHours(e.target.value)
  }

  const handleMinutesChange = (e) => {
    setDelayMinutes(e.target.value)
  }

  const handleSecondsChange = (e) => {
    setDelaySeconds(e.target.value)
  }

  const handleDelayTypeChange = (type) => {
    setDelayType(type)
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
            onClick={() => handleDelayTypeChange('once')}
          >
            최초1회
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'untilCompleted' ? styles.selected : ''
            }`}
            onClick={() => handleDelayTypeChange('untilCompleted')}
          >
            응답할 때 까지
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'always' ? styles.selected : ''
            }`}
            onClick={() => handleDelayTypeChange('always')}
          >
            항상
          </div>
        </div>
        {delayType === 'once' && (
          <>
            <div className={styles.explainTitle}>* 최초 1회</div>
            <div className={styles.explainContent}>
              처음 트리거가 발생했을 때에만 설문조사를 띄우고 응답여부와
              상관없이 다음부터는 띄우지 않습니다.
            </div>
          </>
        )}
        {delayType === 'untilCompleted' && (
          <>
            <div className={styles.explainTitle}>* 응답할 때 까지</div>
            <div className={styles.explainContent}>
              응답을 받을 때까지 계속해서 설문조사를 띄웁니다.
            </div>
          </>
        )}
        {delayType === 'always' && (
          <>
            <div className={styles.explainTitle}>* 항상</div>
            <div className={styles.explainContent}>
              응답여부와 상관없이 설문조사를 항상 띄웁니다.
            </div>
          </>
        )}
        {delayType !== 'once' && (
          <>
            <div className={styles.explainTitle}>발동주기 설정</div>
            <div className={styles.delayInput}>
              <label>
                <input
                  type='number'
                  value={delayDays}
                  onChange={handleDaysChange}
                  onFocus={(e) => e.target.select()}
                  min='0'
                />
                일
              </label>
              <label>
                <input
                  type='number'
                  value={delayHours}
                  onChange={handleHoursChange}
                  onFocus={(e) => e.target.select()}
                  min='0'
                  max='23'
                />
                시간
              </label>
              <label>
                <input
                  type='number'
                  value={delayMinutes}
                  onChange={handleMinutesChange}
                  onFocus={(e) => e.target.select()}
                  min='0'
                  max='59'
                />
                분
              </label>
              <label>
                <input
                  type='number'
                  value={delaySeconds}
                  onChange={handleSecondsChange}
                  onFocus={(e) => e.target.select()}
                  min='0'
                  max='59'
                />
                초
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Delays
