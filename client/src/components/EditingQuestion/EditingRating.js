import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EditingRating = ({ step, updateStep, steps, showWarning }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [options, setOptions] = useState(() => {
    return step.options && step.options.length === 5
      ? step.options.map((option, index) => ({
          ...option,
          value: index + 1,
          nextStepId: option.nextStepId || '',
        }))
      : Array.from({ length: 5 }, (_, index) => ({
          id: uuidv4(),
          value: index + 1,
          nextStepId: '',
        }))
  })

  useEffect(() => {
    setTitle(step.title)
    setDescription(step.description)
    setOptions(() =>
      step.options && step.options.length === 5
        ? step.options.map((option, index) => ({
            ...option,
            value: index + 1,
            nextStepId: option.nextStepId || '',
          }))
        : Array.from({ length: 5 }, (_, index) => ({
            id: uuidv4(),
            value: index + 1,
            nextStepId: '',
          })),
    )
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
  const handleNextStepChange = (optionId, nextStepId) => {
    const newOptions = options.map((option) =>
      option.id === optionId ? { ...option, nextStepId } : option,
    )
    setOptions(newOptions)
    if (
      options.some(
        (option) => option.id === optionId && option.nextStepId !== nextStepId,
      )
    ) {
      updateStep({ ...step, options: newOptions })
    }
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
      <div className={styles.title}>
        *별점의 경우 5점 기준 '매우 동의함', 1점 기준 '전혀 동의하지 않음'으로
        평가 됩니다.
      </div>
      <div className={styles.title}>응답에 따른 이동</div>
      {options.map((option) => (
        <div key={option.id} className={styles.optionAction}>
          <div className={styles.optionLabel}>{option.value}점</div>
          <select
            className={styles.action}
            value={option.nextStepId}
            onChange={(e) => handleNextStepChange(option.id, e.target.value)}
          >
            <option value=''>다음 스텝으로 이동</option>
            {steps.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title}
              </option>
            ))}
            {!steps.some((s) => s.id === option.nextStepId) &&
              option.nextStepId && (
                <option value={option.nextStepId}>삭제된 선택지</option>
              )}
          </select>
        </div>
      ))}
      {showWarning && (
        <div className={styles.warningBubble}>
          참조하고 있던 스텝이 삭제되어 변경이 필요합니다.
        </div>
      )}
    </div>
  )
}

export default EditingRating
