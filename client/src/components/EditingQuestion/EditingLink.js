import styles from './EditingQuestion.module.css'
import { useState, useEffect } from 'react'

const EditingLink = ({ step, updateStep, steps, showWarning }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(step.title)
  const [description, setDescription] = useState(step.description || '')
  const [url, setUrl] = useState(step.url || '')
  const [buttonText, setButtonText] = useState(step.buttonText || '')
  const [nextStepId, setNextStepId] = useState(step.nextStepId || '')

  // 제목 변경 시 상태 업데이트
  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    updateStep({ ...step, title: e.target.value })
  }

  // 설명 변경 시 상태 업데이트
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value)
    updateStep({ ...step, description: e.target.value })
  }

  // URL 변경 시 상태 업데이트
  const handleUrlChange = (e) => {
    setUrl(e.target.value)
    updateStep({ ...step, url: e.target.value })
  }

  // 버튼 텍스트 변경 시 상태 업데이트
  const handleButtonTextChange = (e) => {
    setButtonText(e.target.value)
    updateStep({ ...step, buttonText: e.target.value })
  }

  // 다음 스텝 변경 시 상태 업데이트
  const handleNextStepChange = (e) => {
    setNextStepId(e.target.value)
    updateStep({ ...step, nextStepId: e.target.value })
  }

  // nextStepId 변경 시 유효성 검사 업데이트
  useEffect(() => {
    if (nextStepId !== '' && !steps.some((s) => s.id === nextStepId)) {
      updateStep({ ...step, nextStepId })
    }
  }, [nextStepId, steps, step, updateStep])

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
      <div className={styles.title}>URL</div>
      <input
        type='text'
        value={url}
        onChange={handleUrlChange}
        placeholder='URL을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>버튼 텍스트</div>
      <input
        type='text'
        value={buttonText}
        onChange={handleButtonTextChange}
        placeholder='버튼의 텍스트를 입력하세요.'
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

export default EditingLink
