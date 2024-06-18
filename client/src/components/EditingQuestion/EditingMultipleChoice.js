import styles from './EditingQuestion.module.css'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EditingMultipleChoice = ({ question, onSave, onCancel, questions }) => {
  const [title, setTitle] = useState(question.title)
  const [description, setDescription] = useState(question.description)
  const [options, setOptions] = useState(question.options)
  const [nextQuestionId, setNextQuestionId] = useState(
    question.nextQuestionId || '',
  )

  //저장 핸들러
  const handleSave = () => {
    if (title.trim() === '') {
      alert('제목을 입력해주세요.')
      return
    }
    if (options.length < 2) {
      alert('선택지를 2개 이상 입력해주세요.')
      return
    }

    if (options.some((option) => option.value.trim() === '')) {
      alert('선택지을 모두 채워주세요.')
      return
    }
    onSave({ ...question, title, description, options, nextQuestionId })
  }

  //삭제 핸들러
  const deleteOptionHandler = (id) => {
    const newOptions = options.filter((option) => option.id !== id)
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
      <div className={styles.title}>선택지</div>
      {options.map((option) => (
        <div className={styles.optionBox}>
          <input
            key={option.id}
            type='text'
            value={option.value}
            onChange={(e) => {
              const newOptions = options.map((opt) =>
                opt.id === option.id ? { ...opt, value: e.target.value } : opt,
              )
              setOptions(newOptions)
            }}
            placeholder='선택지를 입력하세요.'
          />
          <div
            className={styles.delete}
            onClick={() => deleteOptionHandler(option.id)}
          >
            삭제
          </div>
        </div>
      ))}
      <div
        onClick={() => setOptions([...options, { id: uuidv4(), value: '' }])}
        className={styles.addOption}
      >
        선택지 추가
      </div>
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

export default EditingMultipleChoice
