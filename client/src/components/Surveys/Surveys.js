import styles from './Surveys.module.css'
import { v4 as uuidv4 } from 'uuid'
import { useState } from 'react'
import EditingFreeText from '../EditingQuestion/EditingFreeText'
import EditingSingleChoice from '../EditingQuestion/EditingSingleChoice'
import EditingMultipleChoice from '../EditingQuestion/EditingMultipleChoice'
import EditingRating from '../EditingQuestion/EditingRating'
import EditingLink from '../EditingQuestion/EditingLink'
import EditingInfo from '../EditingQuestion/EditingInfo'
import EditingWelcome from '../EditingQuestion/EditingWelcome'
import EditingThank from '../EditingQuestion/EditingThank'

const Surveys = ({ survey, setSurvey }) => {
  if (!survey || !survey.steps) return null // survey나 survey.steps가 없으면 아무것도 렌더링하지 않음

  // 새로운 질문 추가를 위한 모달 상태
  const [isAddStep, setIsAddStep] = useState(false)

  // step.type에 따른 텍스트 매핑
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

  // 질문 삭제 핸들러
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

    setSurvey({ ...survey, steps: updatedSteps })
  }

  // 질문 추가 핸들러
  const addStepHandler = (type) => {
    const newStep = {
      id: uuidv4(),
      title: '새 질문',
      description: '',
      type: type,
      options: ['singleChoice', 'multipleChoice', 'rating'].includes(type)
        ? ['옵션1', '옵션2', '옵션3', '옵션4', '옵션5']
        : [],
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
  }

  // 질문 추가시 타입을 고르는 모달
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

  // welcome, thank on/off 토글
  const toggleHandler = (id) => {
    const updatedSteps = survey.steps.map((step) =>
      step.id === id ? { ...step, isActive: !step.isActive } : step,
    )
    setSurvey({ ...survey, steps: updatedSteps })
  }

  // 질문 수정 상태
  const [editingStepId, setEditingStepId] = useState(null)

  // 질문 수정 토글
  const toggleEditMode = (stepId) => {
    if (editingStepId && editingStepId !== stepId) {
      // 다른 질문을 편집하려고 할 때, 현재 편집 중인 질문의 변경사항을 취소합니다.
      const originalStep = survey.steps.find((q) => q.id === editingStepId)
      saveStep(originalStep)
    }
    setEditingStepId(editingStepId === stepId ? null : stepId)
  }

  //질문 수정 함수
  const saveStep = (updatedStep) => {
    const updatedSteps = survey.steps.map((step) =>
      step.id === updatedStep.id ? updatedStep : step,
    )
    setSurvey({ ...survey, steps: updatedSteps })
    setEditingStepId(null)
  }

  //질문 수정 취소
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
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingFreeText>
                )}
                {step.type === 'singleChoice' && (
                  <EditingSingleChoice
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingSingleChoice>
                )}
                {step.type === 'multipleChoice' && (
                  <EditingMultipleChoice
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingMultipleChoice>
                )}
                {step.type === 'rating' && (
                  <EditingRating
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingRating>
                )}
                {step.type === 'link' && (
                  <EditingLink
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingLink>
                )}
                {step.type === 'info' && (
                  <EditingInfo
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingInfo>
                )}
                {step.type === 'welcome' && (
                  <EditingWelcome
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingWelcome>
                )}
                {step.type === 'thank' && (
                  <EditingThank
                    step={step}
                    onSave={(updatedStep) => {
                      saveStep(updatedStep)
                    }}
                    onCancel={cancelEdit}
                    steps={survey.steps}
                  ></EditingThank>
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
