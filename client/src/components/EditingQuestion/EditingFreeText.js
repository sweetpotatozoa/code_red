import styles from './EditingQuestion.module.css'
import React, { useState, useEffect } from 'react'

const EditingFreeText = ({ step, onSave, onCancel, steps }) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [nextStepId, setNextStepId] = useState(step.nextStepId || '')

  // nextStepId가 유효한지 확인하고, 유효하지 않으면 초기화
  useEffect(() => {
    if (nextStepId && !steps.some((s) => s.id === nextStepId)) {
      setNextStepId('')
    }
  }, [nextStepId, steps])

  //저장 핸들러
  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...step, title, description, nextStepId })
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='질문을 입력하세요.'
      />
      <div className={styles.title}>설명</div>
      <input
        type='text'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='설명 (선택사항)'
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

export default EditingFreeText
