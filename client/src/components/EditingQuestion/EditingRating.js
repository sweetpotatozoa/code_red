import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EditingRating = ({ step, onSave, onCancel, steps, showWarning }) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [options, setOptions] = useState(() => {
    // 기존 옵션이 있으면 사용하고, 없으면 기본 5개 별점 옵션 생성
    return (
      step.options ||
      Array.from({ length: 5 }, (_, index) => ({
        id: uuidv4(),
        value: index + 1,
        nextStepId: '',
      }))
    )
  })
  const [localShowWarning, setLocalShowWarning] = useState(showWarning)

  useEffect(() => {
    setLocalShowWarning(showWarning)
  }, [showWarning])

  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...step, title, description, options })
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
      <div className={styles.title}>
        *별점의 경우 5점 기준 '매우 동의함', 1점 기준 '전혀 동의하지 않음'으로
        평가 됩니다.
      </div>
      <div className={styles.title}>별점별 액션</div>
      {options.map((option) => (
        <div key={option.id} className={styles.optionAction}>
          <div className={styles.optionLabel}>{option.value}점</div>
          <select
            className={styles.action}
            value={option.nextStepId || ''}
            onChange={(e) => nextStepHandler(option.id, e.target.value)}
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

export default EditingRating
