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
  const [url, setUrl] = useState(trigger.url || '')

  // 트리거 저장 핸들러
  const saveTrigger = () => {
    if (!title) {
      alert('제목을 입력해주세요!')
      return
    }
    if (!url) {
      alert('URL을 입력해주세요!')
      return
    }

    const updatedTrigger = {
      ...trigger,
      title: title,
      description: description,
      url: url,
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
        placeholder='제목을 입력하세요.'
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
      <div className={styles.title}>URL</div>
      <input
        type='text'
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder='URL을 입력하세요.'
      />
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
