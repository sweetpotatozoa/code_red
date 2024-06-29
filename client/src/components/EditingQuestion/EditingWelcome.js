import styles from './EditingQuestion.module.css'
import { useState } from 'react'

const EditingWelcome = ({ question, onSave, onCancel }) => {
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description)

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...question, title, description })
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        className={styles.input}
        type='text'
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder='질문을 입력하세요.'
      />
      <div className={styles.title}>설명</div>
      <input
        className={styles.input}
        type='text'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='설명 (선택사항)'
      />
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
