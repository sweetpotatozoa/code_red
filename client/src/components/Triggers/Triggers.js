import styles from './Triggers.module.css'
import AddTriggerModal from '../AddTriggerModal/AddTriggerModal'
import { useState } from 'react'

const Triggers = ({ survey, setSurvey }) => {
  const [isAddTrigger, setIsaddTrigger] = useState(false)
  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음
  return (
    <div className={styles.triggers}>
      <div className={styles.explain}>
        <div>
          <div className={styles.explainTitle}>트리거 구성</div>
          <div className={styles.explainContent}>
            어떤 조건에서 설문조사가 뜨게 하고 싶으신가요?
          </div>
        </div>
        <a href='https://www.naver.com/' target='_blank'>
          <div className={styles.guide}>가이드</div>
        </a>
      </div>
      <div className={styles.triggerList}>
        <div className={styles.trigger}>
          <div className={styles.triggerContent}>
            <div className={styles.triggerTitle}>안녕 나는 제목</div>
            <div className={styles.triggerDiscription}>하이요!</div>
          </div>
          <div className={styles.triggerDelete}>삭제</div>
        </div>
        <div className={styles.trigger}>
          <div className={styles.triggerContent}>
            <div className={styles.triggerTitle}>안녕 나는 제목</div>
            <div className={styles.triggerDiscription}>하이요!</div>
          </div>
          <div className={styles.triggerDelete}>삭제</div>
        </div>
        <div
          className={styles.addTrigger}
          onClick={() => setIsaddTrigger(true)}
        >
          새로운 트리거 추가 +
        </div>
      </div>
      {isAddTrigger && <AddTriggerModal setIsaddTrigger={setIsaddTrigger} />}
    </div>
  )
}

export default Triggers
