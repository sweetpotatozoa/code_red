import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EditingSingleChoice = ({
  step,
  onSave,
  onCancel,
  steps,
  showWarning,
}) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [options, setOptions] = useState(step.options || [])
  const [localShowWarning, setLocalShowWarning] = useState(showWarning)

  useEffect(() => {
    setLocalShowWarning(showWarning)
  }, [showWarning])

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }

    if (options.length < 2) {
      alert('선택지를 2개 이상 입력해주세요.')
      return
    }

    if (options.some((option) => !option.value || option.value.trim() === '')) {
      alert('선택지를 모두 채워주세요.')
      return
    }

    onSave({ ...step, title, description, options })
  }

  const deleteOptionHandler = (id) => {
    setOptions(options.filter((option) => option.id !== id))
  }

  const addOptionHandler = () => {
    setOptions([
      ...options,
      { id: uuidv4(), value: '새 선택지', nextStepId: '' },
    ])
  }

  const changeOptionHandler = (id, value) => {
    setOptions(
      options.map((option) =>
        option.id === id ? { ...option, value } : option,
      ),
    )
  }

  const nextStepHandler = (optionId, nextStepId) => {
    setOptions(
      options.map((option) =>
        option.id === optionId ? { ...option, nextStepId } : option,
      ),
    )
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

      <div className={styles.title}>선택지</div>
      {options.map((option) => (
        <div className={styles.optionBox} key={option.id}>
          <input
            className={styles.input}
            type='text'
            value={option.value}
            onChange={(e) => changeOptionHandler(option.id, e.target.value)}
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

      <div className={styles.title}>선택지별 액션</div>
      {options.map((option) => (
        <div key={option.id} className={styles.optionAction}>
          <div className={styles.optionLabel}>{option.value}</div>
          <select
            value={option.nextStepId || ''}
            onChange={(e) => nextStepHandler(option.id, e.target.value)}
            className={styles.action}
          >
            <option value=''>다음 질문으로 이동</option>
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
      {localShowWarning && (
        <div className={styles.warningBubble}>
          참조하고 있던 스텝이 삭제되어 변경이 필요합니다.
        </div>
      )}

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

export default EditingSingleChoice
