import styles from './Triggers.module.css'
import AddTriggerModal from '../AddTriggerModal/AddTriggerModal'
import { useState, useRef } from 'react'
import EditingFirstVisit from '../EditingTriggers/EditingFirstVisit'
import EditingClick from '../EditingTriggers/EditingClick'
import EditingExit from '../EditingTriggers/EditingExit'
import EditingScroll from '../EditingTriggers/EditingScroll'

// 트리거 타입을 한글로 변환하는 함수
const getTriggerTypeInKorean = (type) => {
  switch (type) {
    case 'firstVisit':
      return '페이지뷰'
    case 'click':
      return '클릭'
    case 'exit':
      return '이탈'
    case 'scroll':
      return '스크롤'
    default:
      return type // 알 수 없는 타입의 경우 원래 값을 반환
  }
}

const Triggers = ({ survey, setSurvey }) => {
  const [isAddTrigger, setIsAddTrigger] = useState(false)
  const [editingTriggerId, setEditingTriggerId] = useState(null) // 상태로 관리
  const triggerRefs = useRef({})

  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음

  // 트리거 삭제 핸들러
  const deleteTriggerHandler = (id, event) => {
    event.preventDefault()
    event.stopPropagation() // 이벤트 전파 중지
    if (!window.confirm('정말로 이 트리거를 삭제하시겠습니까?')) {
      return
    }
    const updatedTriggers = survey.triggers.filter(
      (trigger) => trigger.id !== id,
    )
    const updatedSurvey = { ...survey, triggers: updatedTriggers }
    setSurvey(updatedSurvey)
    if (editingTriggerId === id) {
      setEditingTriggerId(null) // 편집 중인 트리거가 삭제된 경우에만 편집 모드 종료
    }
  }

  // 트리거 수정 핸들러
  const updateTrigger = (updatedTrigger) => {
    const updatedTriggers = survey.triggers.map((t) =>
      t.id === updatedTrigger.id ? updatedTrigger : t,
    )
    const updatedSurvey = { ...survey, triggers: updatedTriggers }
    setSurvey(updatedSurvey)
  }

  //  트리거 수정모드 토글
  const toggleEditMode = (triggerId, event) => {
    if (event) {
      event.stopPropagation()
    }
    setEditingTriggerId(editingTriggerId === triggerId ? null : triggerId)
  }

  return (
    <div className={styles.triggers}>
      <div className={styles.explain}>
        <div>
          <div className={styles.explainTitle}>트리거 구성</div>
          <div className={styles.explainContent}>
            어떤 조건에서 설문조사가 뜨게 하고 싶으신가요?
          </div>
        </div>
        <a
          href='https://zenith-income-03c.notion.site/1-079333926e1c44899b4d44ab50a98a83/'
          target='_blank'
          rel='noreferrer'
        >
          <div className={styles.guide}>가이드</div>
        </a>
      </div>
      <div className={styles.triggerList}>
        {survey.triggers &&
          survey.triggers.map((trigger) => (
            <div
              key={trigger.id}
              className={styles.trigger}
              ref={(el) => (triggerRefs.current[trigger.id] = el)}
            >
              {editingTriggerId === trigger.id ? (
                <div
                  className={styles.triggerContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  {trigger.type === 'firstVisit' && (
                    <EditingFirstVisit
                      trigger={trigger}
                      updateTrigger={updateTrigger}
                      setEditingTriggerId={setEditingTriggerId} // 전달
                    />
                  )}
                  {trigger.type === 'click' && (
                    <EditingClick
                      trigger={trigger}
                      updateTrigger={updateTrigger}
                      setEditingTriggerId={setEditingTriggerId} // 전달
                    />
                  )}
                  {trigger.type === 'exit' && (
                    <EditingExit
                      trigger={trigger}
                      updateTrigger={updateTrigger}
                      setEditingTriggerId={setEditingTriggerId} // 전달
                    />
                  )}
                  {trigger.type === 'scroll' && (
                    <EditingScroll
                      trigger={trigger}
                      updateTrigger={updateTrigger}
                      setEditingTriggerId={setEditingTriggerId} // 전달
                    />
                  )}
                </div>
              ) : (
                <div
                  className={styles.triggerContent}
                  onClick={(e) => toggleEditMode(trigger.id, e)}
                >
                  <div className={styles.triggerTitle}>{trigger.title}</div>
                  <div className={styles.triggerDescription}>
                    {getTriggerTypeInKorean(trigger.type)}
                  </div>
                </div>
              )}
              <div
                className={styles.triggerDelete}
                onClick={(e) => deleteTriggerHandler(trigger.id, e)}
              >
                삭제
              </div>
            </div>
          ))}
        <div
          className={styles.addTrigger}
          onClick={() => setIsAddTrigger(true)}
        >
          새로운 트리거 추가 +
        </div>
      </div>
      {isAddTrigger && (
        <AddTriggerModal
          setIsAddTrigger={setIsAddTrigger}
          survey={survey}
          setSurvey={setSurvey}
        />
      )}
    </div>
  )
}

export default Triggers
