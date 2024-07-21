import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EditingMultipleChoice = ({ step, updateStep, steps, showWarning }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [options, setOptions] = useState(() => {
    return (step.options || []).map((option) => ({
      id: option.id || uuidv4(),
      value: option.value || '',
    }))
  })
  const [nextStepId, setNextStepId] = useState(step.nextStepId || '')

  useEffect(() => {
    setTitle(step.title)
    setDescription(step.description)
    setOptions(step.options || [])
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

  // 옵션 변경 시 상태 업데이트
  const handleOptionChange = (id, value) => {
    const newOptions = options.map((option) =>
      option.id === id ? { ...option, value } : option,
    )
    setOptions(newOptions)
    updateStep({ ...step, options: newOptions })
  }

  // 옵션 삭제
  const deleteOptionHandler = (id) => {
    const newOptions = options.filter((option) => option.id !== id)
    setOptions(newOptions)
    updateStep({ ...step, options: newOptions })
  }

  // 옵션 추가
  const addOptionHandler = () => {
    const newOptions = [...options, { id: uuidv4(), value: '' }]
    setOptions(newOptions)
    updateStep({ ...step, options: newOptions })
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
        placeholder='제목을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>설명</div>
      <input
        type='text'
        value={description}
        onChange={handleDescriptionChange}
        placeholder='설명을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>선택지</div>
      {options.map((option) => (
        <div className={styles.optionBox} key={option.id}>
          <input
            className={styles.input}
            type='text'
            value={option.value}
            onChange={(e) => handleOptionChange(option.id, e.target.value)}
            placeholder='새 선택지'
          />
          <div
            className={styles.delete}
            onClick={() => deleteOptionHandler(option.id)}
          >
            삭제
          </div>
        </div>
      ))}
      <div onClick={addOptionHandler} className={styles.addOption}>
        선택지 추가
      </div>
      <div className={styles.title}>응답에 따른 이동</div>
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

export default EditingMultipleChoice
