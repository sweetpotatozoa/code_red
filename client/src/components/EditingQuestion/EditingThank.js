import styles from './EditingQuestion.module.css'
import { useState } from 'react'

const EditingThank = ({ step, updateStep }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)

  // 제목 변경 시 상태 업데이트
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    updateStep({ ...step, title: newTitle })
  }

  // 설명 변경 시 상태 업데이트
  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    updateStep({ ...step, description: newDescription })
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        className={styles.input}
        type='text'
        value={title}
        onChange={handleTitleChange}
        placeholder='제목을 입력하세요.'
      />
      <div className={styles.title}>설명</div>
      <input
        className={styles.input}
        type='text'
        value={description}
        onChange={handleDescriptionChange}
        placeholder='설명을 입력하세요.'
      />
    </div>
  )
}

export default EditingThank
