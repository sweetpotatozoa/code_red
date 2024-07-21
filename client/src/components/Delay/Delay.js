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
          설문조사가 뜨는 주기를 설정합니다.
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
            최초 1회
          </div>
          <div
            className={`${styles.type} ${
              delayType === 'untilCompleted' ? styles.selected : ''
            }`}
            onClick={() => handleDelayTypeChange('untilCompleted')}
          >
            응답할 때까지
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
              처음 트리거가 발생했을 때에만 설문조사를 띄우고 응답 여부와
              상관없이 다시 띄우지 않습니다.
            </div>
          </>
        )}
        {delayType === 'untilCompleted' && (
          <>
            <div className={styles.explainTitle}>* 응답할 때까지</div>
            <div className={styles.explainContent}>
              응답에 참여하지 않을 경우, 응답을 받을 때까지 다시 설문조사를
              띄웁니다.
            </div>
          </>
        )}
        {delayType === 'always' && (
          <>
            <div className={styles.explainTitle}>* 항상</div>
            <div className={styles.explainContent}>
              응답 여부와 상관없이 트리거가 발생했을 경우 설문조사를 반복하여
              띄웁니다.
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
            <div className={styles.explainTitle} style={{ marginTop: '16px' }}>
              * 발동주기 설정이란?
            </div>
            <div className={styles.explainContent}>
              설문조사가 지나치게 자주 표시되는 것을 방지하기 위해 설정합니다.
              <br />
              예를 들어, 발동주기 유형이 "항상"이어도 발동주기 설정을 1일로 하면
              하루에 1번만 표시됩니다.
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Delays
