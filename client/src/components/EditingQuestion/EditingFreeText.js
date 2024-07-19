import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'

const EditingFreeText = ({ step, updateStep, steps, showWarning }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [nextStepId, setNextStepId] = useState(step.nextStepId || '')

  useEffect(() => {
    setTitle(step.title)
    setDescription(step.description)
    setNextStepId(step.nextStepId || '')
  }, [step])

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

  // 다음 스텝 변경 시 상태 업데이트
  const handleNextStepChange = (e) => {
    const newNextStepId = e.target.value
    setNextStepId(newNextStepId)
    if (newNextStepId !== step.nextStepId) {
      updateStep({ ...step, nextStepId: newNextStepId })
    }
  }

  return (
    <div>
      <div className={styles.title}>제목</div>
      <input
        type='text'
        value={title}
        onChange={handleTitleChange}
        placeholder='질문을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>설명</div>
      <input
        type='text'
        value={description}
        onChange={handleDescriptionChange}
        placeholder='설명 (선택사항)'
        className={styles.input}
      />
      <div className={styles.title}>응답에 따른 대응</div>
      <select
        className={styles.action}
        value={nextStepId}
        onChange={handleNextStepChange}
      >
        <option value=''>다음 질문으로 이동</option>
        {steps.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
        {!steps.some((s) => s.id === nextStepId) && nextStepId && (
          <option value={nextStepId}>삭제된 선택지</option>
        )}
      </select>
      {showWarning && (
        <div className={styles.warningBubble}>
          참조하고 있던 스텝이 삭제되어 변경이 필요합니다.
        </div>
      )}
    </div>
  )
}

export default EditingFreeText
