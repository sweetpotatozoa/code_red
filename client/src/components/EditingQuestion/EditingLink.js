import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'

const EditingLink = ({ step, onSave, onCancel, steps }) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description || '')
  const [url, setUrl] = useState(step.url || '')
  const [buttonText, setButtonText] = useState(step.buttonText || '')
  const [nextStepId, setNextStepId] = useState(step.nextStepId || '')

  useEffect(() => {
    if (nextStepId && !steps.some((s) => s.id === nextStepId)) {
      setNextStepId('')
    }
  }, [nextStepId, steps])

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }

    if (url.trim() === '') {
      alert('URL을 입력해주세요.')
      return
    }

    if (buttonText.trim() === '') {
      alert('버튼 텍스트를 입력해주세요.')
      return
    }
    onSave({ ...step, title, description, url, nextStepId, buttonText })
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
      <div className={styles.title}>URL</div>
      <input
        type='text'
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder='URL을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>버튼 텍스트</div>
      <input
        type='text'
        value={buttonText}
        onChange={(e) => setButtonText(e.target.value)}
        placeholder='버튼의 텍스트를 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>응답에 따른 대응</div>
      <select
        className={styles.action}
        value={nextStepId}
        onChange={(e) => setNextStepId(e.target.value)}
      >
        <option value=''>다음 질문으로 이동</option>
        {steps.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
      <div className={styles.bottom}>
        <div className={styles.leftBtn} onClick={onCancel}>
          취소
        </div>
        <div onClick={handleSave} className={styles.button}>
          저장
        </div>
      </div>
    </div>
  )
}

export default EditingLink
