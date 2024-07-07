import styles from './Triggers.module.css'
import AddTriggerModal from '../AddTriggerModal/AddTriggerModal'
import { useState } from 'react'
import EditingFirstVisit from '../EditingTriggers/EditingFirstVisit'
import EditingUrl from '../EditingTriggers/EditingUrl'
import EditingClick from '../EditingTriggers/EditingClick'
import EditingExit from '../EditingTriggers/EditingExit'
import EditingScroll from '../EditingTriggers/EditingScroll'

// 트리거 타입을 한글로 변환하는 함수
const getTriggerTypeInKorean = (type) => {
  switch (type) {
    case 'firstVisit':
      return '첫 방문'
    case 'url':
      return 'URL'
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
  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음

  // 트리거 삭제 핸들러
  const deleteTriggerHandler = (id) => {
    const updatedTriggers = survey.triggers.filter(
      (trigger) => trigger.id !== id,
    )
    const updatedSurvey = { ...survey, triggers: updatedTriggers }
    if (!window.confirm('정말로 이 트리거를 삭제하시겠습니까?')) {
      return
    }
    setSurvey(updatedSurvey)
  }

  // 트리거 수정 아이디
  const [editingTriggerId, setEditingTriggerId] = useState(null)

  //  트리거 수정 토글
  const toggleEditMode = (triggerId) => {
    if (editingTriggerId && editingTriggerId !== triggerId) {
      // 다른 질문을 편집하려고 할 때, 현재 편집 중인 트리거의 변경사항을 취소합니다.
      const originalTrigger = survey.triggers.find(
        (t) => t.id === editingTriggerId,
      )
      saveTrigger(originalTrigger)
    }
    setEditingTriggerId(editingTriggerId === triggerId ? null : triggerId)
  }

  // 트리거 수정 핸들러
  const saveTrigger = (updatedTrigger) => {
    const updatedTriggers = survey.triggers.map((t) =>
      t.id === updatedTrigger.id ? updatedTrigger : t,
    )
    const updatedSurvey = { ...survey, triggers: updatedTriggers }
    setSurvey(updatedSurvey)
    setEditingTriggerId(null)
  }

  //트리거 수정 취소
  const TriggerEditCancel = () => {
    setEditingTriggerId(null)
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
        <a href='https://www.naver.com/' target='_blank'>
          <div className={styles.guide}>가이드</div>
        </a>
      </div>
      <div className={styles.triggerList}>
        {survey.triggers &&
          survey.triggers.map((trigger) => (
            <div key={trigger.id} className={styles.trigger}>
              {editingTriggerId === trigger.id ? (
                <div className={styles.triggerContent}>
                  {trigger.type === 'firstVisit' && (
                    <EditingFirstVisit
                      trigger={trigger}
                      TriggerEditCancel={TriggerEditCancel}
                      survey={survey}
                      setSurvey={setSurvey}
                      setEditingTriggerId={setEditingTriggerId}
                    />
                  )}
                  {trigger.type === 'url' && (
                    <EditingUrl
                      trigger={trigger}
                      TriggerEditCancel={TriggerEditCancel}
                      survey={survey}
                      setSurvey={setSurvey}
                      setEditingTriggerId={setEditingTriggerId}
                    />
                  )}
                  {trigger.type === 'click' && (
                    <EditingClick
                      trigger={trigger}
                      TriggerEditCancel={TriggerEditCancel}
                      survey={survey}
                      setSurvey={setSurvey}
                      setEditingTriggerId={setEditingTriggerId}
                    />
                  )}
                  {trigger.type === 'exit' && (
                    <EditingExit
                      trigger={trigger}
                      TriggerEditCancel={TriggerEditCancel}
                      survey={survey}
                      setSurvey={setSurvey}
                      setEditingTriggerId={setEditingTriggerId}
                    />
                  )}
                  {trigger.type === 'scroll' && (
                    <EditingScroll
                      trigger={trigger}
                      TriggerEditCancel={TriggerEditCancel}
                      survey={survey}
                      setSurvey={setSurvey}
                      setEditingTriggerId={setEditingTriggerId}
                    />
                  )}
                </div>
              ) : (
                <div
                  className={styles.triggerContent}
                  onClick={() => toggleEditMode(trigger.id)}
                >
                  <div className={styles.triggerTitle}>{trigger.title}</div>
                  <div className={styles.triggerDescription}>
                    {getTriggerTypeInKorean(trigger.type)}
                  </div>
                </div>
              )}
              <div
                className={styles.triggerDelete}
                onClick={() => deleteTriggerHandler(trigger.id)}
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
