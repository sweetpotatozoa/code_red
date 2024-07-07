import styles from './EditingQuestion.module.css'
import { useState } from 'react'

const EditingWelcome = ({ step, onSave, onCancel }) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [isActive, setIsActive] = useState(step.isActive)

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...step, title, description, isActive })
  }

  const toggleActive = () => {
    setIsActive(!isActive)
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        className={styles.input}
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='제목을 입력하세요.'
      />
      <div className={styles.title}>설명</div>
      <textarea
        className={styles.textarea}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='설명을 입력하세요.'
        rows={4}
      />
      <div className={styles.toggleContainer}>
        <span className={styles.toggleLabel}>활성화</span>
        <label className={styles.switch}>
          <input type='checkbox' checked={isActive} onChange={toggleActive} />
          <span className={styles.slider}></span>
        </label>
      </div>
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

export default EditingWelcome
