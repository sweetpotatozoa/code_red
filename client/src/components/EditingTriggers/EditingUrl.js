import styles from './EditingTriggers.module.css'
import { useState } from 'react'

const EditingUrl = ({
  trigger,
  TriggerEditCancel,
  survey,
  setSurvey,
  setEditingTriggerId,
}) => {
  const [title, setTitle] = useState(trigger.title)
  const [description, setDescription] = useState(trigger.description || '')
  const [pageType, setPageType] = useState(trigger.pageType)
  const [pageValue, setPageValue] = useState(trigger.pageValue || '')

  // 트리거 저장 핸들러
  const saveTrigger = () => {
    if (!title) {
      alert('제목을 입력해주세요!')
      return
    }
    if (pageType === 'specific' && !pageValue) {
      alert('페이지 URL을 입력해주세요!')
      return
    }

    const updatedTrigger = {
      ...trigger,
      title: title,
      description: description,
      pageType: pageType,
      pageValue: pageValue,
    }
    const updatedTriggers = survey.triggers.map((t) =>
      t.id === updatedTrigger.id ? updatedTrigger : t,
    )
    const updatedSurvey = { ...survey, triggers: updatedTriggers }
    setSurvey(updatedSurvey)
    setEditingTriggerId(null)
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='질문을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>설명</div>
      <input
        type='text'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='설명 (선택사항)'
        className={styles.input}
      />
      <div className={styles.title}>페이지 지정하기</div>
      <div className={styles.types}>
        <div
          className={`${styles.type} ${
            pageType === 'all' ? styles.selected : ''
          }`}
          onClick={() => setPageType('all')}
        >
          모든 페이지
        </div>
        <div
          className={`${styles.type} ${
            pageType === 'specific' ? styles.selected : ''
          }`}
          onClick={() => setPageType('specific')}
        >
          특정 페이지
        </div>
      </div>
      {pageType === 'specific' && (
        <>
          <div className={styles.title}>특정 페이지 URL 입력하기</div>
          <input
            type='text'
            value={pageValue}
            onChange={(e) => setPageValue(e.target.value)}
            placeholder='특정 페이지 URL을 입력하세요.'
            className={styles.input}
          />
        </>
      )}
      <div className={styles.bottom}>
        <div className={styles.leftBtn} onClick={TriggerEditCancel}>
          취소
        </div>
        <div className={styles.button} onClick={saveTrigger}>
          저장
        </div>
      </div>
    </div>
  )
}

export default EditingUrl
