import styles from './EditingQuestion.module.css'
import { useState } from 'react'

const EditingRating = ({ step, onSave, onCancel, steps }) => {
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description)
  const [options, setOptions] = useState(step.options || [])

  //저장 핸들러
  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    onSave({ ...step, title, description, options })
  }

  //다음 질문 선택 핸들러
  const nextStepHandler = (optionId, nextStepId) => {
    const newOptions = options.map((option) =>
      option.id === optionId ? { ...option, nextStepId } : option,
    )
    setOptions(newOptions)
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
      <div className={styles.title}>
        *별점의 경우 5점 기준 '매우 동의함', 1점 기준 '전혀 동의하지 않음'으로
        평가 됩니다.
      </div>
      <div className={styles.title}>선택지에 따른 대응</div>
      {options.map((option, index) => (
        <div key={option.id} className={styles.option}>
          {index + 1}점
          <select
            className={styles.action}
            value={option.nextStepId || ''}
            onChange={(e) => nextStepHandler(option.id, e.target.value)}
          >
            <option value=''>다음 질문으로 이동</option>
            {steps.map((q) => (
              <option key={q.id}>{q.title}</option>
            ))}
          </select>
        </div>
      ))}
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
