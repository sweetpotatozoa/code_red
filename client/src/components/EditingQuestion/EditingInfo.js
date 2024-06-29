import styles from './EditingQuestion.module.css'
import { useState } from 'react'

const EditingInfo = ({ question, onSave, onCancel, questions }) => {
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description)
  const [nextQuestionId, setNextQuestionId] = useState(
    question.nextQuestionId || '',
  )

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...question, title, description, nextQuestionId })
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
        className={styles.input}
        type='text'
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder='설명 (선택사항)'
      />
      <div className={styles.title}>응답에 따른 대응</div>
      <select
        className={styles.action}
        value={nextQuestionId}
        onChange={(e) => setNextQuestionId(e.target.value)}
      >
        <option value=''>다음 질문으로 이동</option>
        {questions.map((q) => (
          <option key={q.id}>{q.title}</option>
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

export default EditingInfo
