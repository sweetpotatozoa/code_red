import styles from './Surveys.module.css'
import { v4 as uuidv4 } from 'uuid'
import { useState, useEffect, useRef, useCallback } from 'react'
import EditingFreeText from '../EditingQuestion/EditingFreeText'
import EditingSingleChoice from '../EditingQuestion/EditingSingleChoice'
import EditingMultipleChoice from '../EditingQuestion/EditingMultipleChoice'
import EditingRating from '../EditingQuestion/EditingRating'
import EditingLink from '../EditingQuestion/EditingLink'
import EditingInfo from '../EditingQuestion/EditingInfo'
import EditingWelcome from '../EditingQuestion/EditingWelcome'
import EditingThank from '../EditingQuestion/EditingThank'

const Surveys = ({ survey, setSurvey, invalidSteps, setInvalidSteps }) => {
  if (!survey || !survey.steps) return null

  const [isAddStep, setIsAddStep] = useState(false)
  const [editingStepId, setEditingStepId] = useState(null)
  const stepRefs = useRef({})

  const stepTypeText = {
    welcome: '환영 인사',
    singleChoice: '객관식(중복 불가)',
    multipleChoice: '객관식(중복 가능)',
    rating: '별점',
    info: '안내',
    link: '외부 링크',
    thank: '감사 인사',
    freeText: '주관식',
  }

  const scrollToStep = useCallback((stepId) => {
    const stepElement = stepRefs.current[stepId]
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [])

  useEffect(() => {
    if (editingStepId) {
      scrollToStep(editingStepId)
    }
  }, [editingStepId, scrollToStep])

  useEffect(() => {
    validateSteps()
  }, [survey.steps])

  const validateSteps = () => {
    const invalid = {}
    survey.steps.forEach((step, index) => {
      if (
        step.nextStepId &&
        !survey.steps.some((s) => s.id === step.nextStepId)
      ) {
        invalid[step.id] = index
      }
      if (step.options) {
        step.options.forEach((option) => {
          if (
            option.nextStepId &&
            !survey.steps.some((s) => s.id === option.nextStepId)
          ) {
            invalid[step.id] = index
          }
        })
      }
    })
    setInvalidSteps(invalid)
  }

  const handleSaveStep = (updatedStep) => {
    const updatedSteps = survey.steps.map((step) =>
      step.id === updatedStep.id ? updatedStep : step,
    )
    setSurvey({ ...survey, steps: updatedSteps })
    validateSteps()
    const nextInvalidStepId = Object.keys(invalidSteps)[0]
    if (nextInvalidStepId) {
      setEditingStepId(nextInvalidStepId)
    } else {
      setEditingStepId(null)
    }
  }

  const deleteHandler = (id) => {
    const stepToDelete = survey.steps.find((step) => step.id === id)
    if (stepToDelete.type === 'welcome' || stepToDelete.type === 'thank') {
      alert('환영 및 감사 인사는 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      return
    }

    const updatedSteps = survey.steps.filter((steps) => steps.id !== id)
    const invalidSteps = {}

    updatedSteps.forEach((step) => {
      if (step.nextStepId === id) {
        invalidSteps[step.id] = true
      }
      if (step.options) {
        step.options.forEach((option) => {
          if (option.nextStepId === id) {
            invalidSteps[step.id] = true
          }
        })
      }
    })

    setSurvey({ ...survey, steps: updatedSteps })
    setInvalidSteps(invalidSteps)
    const nextInvalidStepId = Object.keys(invalidSteps)[0]
    if (nextInvalidStepId) {
      setEditingStepId(nextInvalidStepId)
      scrollToStep(nextInvalidStepId)
    }
  }

  const addStepHandler = (type) => {
    const newStep = {
      id: uuidv4(),
      title: '새 질문',
      description: '',
      type: type,
    }

    if (['singleChoice', 'multipleChoice', 'rating'].includes(type)) {
      newStep.options = ['옵션1', '옵션2', '옵션3', '옵션4', '옵션5']
    }

    const updatedSteps = [...survey.steps]
    const thankStepIndex = updatedSteps.findIndex((q) => q.type === 'thank')

    if (thankStepIndex !== -1) {
      updatedSteps.splice(thankStepIndex, 0, newStep)
    } else {
      updatedSteps.push(newStep)
    }

    setSurvey({ ...survey, steps: updatedSteps })
    setIsAddStep(false)
    setEditingStepId(newStep.id)
    setTimeout(() => scrollToStep(newStep.id), 100)
  }

  const AddStepModal = () => {
    if (!isAddStep) return null
    const stepTypes = [
      { value: 'singleChoice', label: '객관식(중복 불가)' },
      { value: 'multipleChoice', label: '객관식(중복 가능)' },
      { value: 'freeText', label: '주관식' },
      { value: 'rating', label: '별점' },
      { value: 'link', label: '외부 링크' },
      { value: 'info', label: '안내' },
    ]
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>추가할 질문 유형 선택</div>
          <div className={styles.modalTypes}>
            {stepTypes.map((type) => (
              <div
                key={type.value}
                className={styles.modalType}
                onClick={() => addStepHandler(type.value)}
              >
                {type.label}
              </div>
            ))}
          </div>
          <div className={styles.modalBottom}>
            <div
              className={styles.modalClose}
              onClick={() => setIsAddStep(false)}
            >
              취소
            </div>
          </div>
        </div>
      </div>
    )
  }

  const toggleHandler = (id) => {
    const updatedSteps = survey.steps.map((step) =>
      step.id === id ? { ...step, isActive: !step.isActive } : step,
    )
    setSurvey({ ...survey, steps: updatedSteps })
  }

  const toggleEditMode = (stepId) => {
    if (editingStepId && editingStepId !== stepId) {
      const originalStep = survey.steps.find((q) => q.id === editingStepId)
      handleSaveStep(originalStep)
    }
    setEditingStepId(editingStepId === stepId ? null : stepId)
    if (stepId) {
      scrollToStep(stepId)
    }
  }

  const cancelEdit = () => {
    setEditingStepId(null)
  }

  return (
    <div className={styles.surveys}>
      {survey.steps
        .sort((a, b) => {
          if (a.type === 'welcome') return -1
          if (b.type === 'welcome') return 1
          if (a.type === 'thank') return 1
          if (b.type === 'thank') return -1
          return 0
        })
        .map((step, index) => (
          <div
            className={`${styles.survey} ${
              editingStepId === step.id ? styles.editing : ''
            }`}
            key={step.id}
            ref={(el) => (stepRefs.current[step.id] = el)}
          >
            <div className={styles.surveyNum}>
              {step.type === 'welcome'
                ? 'Hi'
                : step.type === 'thank'
                  ? 'Bye'
                  : index}
            </div>
            {editingStepId === step.id ? (
              <div className={styles.surveyContents}>
                {step.type === 'freeText' && (
                  <EditingFreeText
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'singleChoice' && (
                  <EditingSingleChoice
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'multipleChoice' && (
                  <EditingMultipleChoice
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'rating' && (
                  <EditingRating
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'link' && (
                  <EditingLink
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'info' && (
                  <EditingInfo
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                    showWarning={step.id in invalidSteps}
                  />
                )}
                {step.type === 'welcome' && (
                  <EditingWelcome
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  />
                )}
                {step.type === 'thank' && (
                  <EditingThank
                    step={step}
                    onSave={handleSaveStep}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  />
                )}
              </div>
            ) : (
              <div
                className={styles.surveyContents}
                onClick={() => toggleEditMode(step.id)}
              >
                <div className={styles.surveyStep}>{step.title}</div>
                <div className={styles.stepType}>{stepTypeText[step.type]}</div>
              </div>
            )}

            {step.type === 'welcome' || step.type === 'thank' ? (
              <div className={styles.stepToggle}>
                <div className={styles.label}>
                  {step.isActive ? 'On' : 'Off'}
                </div>
                <label className={styles.switch}>
                  <input
                    type='checkbox'
                    checked={step.isActive}
                    onChange={() => toggleHandler(step.id)}
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>
            ) : (
              <div className={styles.stepDelete}>
                <div
                  className={styles.label}
                  onClick={() => deleteHandler(step.id)}
                >
                  삭제
                </div>
              </div>
            )}
          </div>
        ))}
      <div className={styles.addSurvey}>
        <div
          className={styles.addSurveyButton}
          onClick={() => setIsAddStep(true)}
        >
          새 질문 추가 +
        </div>
      </div>
      {AddStepModal()}
    </div>
  )
}

export default Surveys
