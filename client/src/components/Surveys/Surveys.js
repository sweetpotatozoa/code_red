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
import { useNavigate } from 'react-router-dom'

const Surveys = ({ survey, setSurvey }) => {
  if (!survey || !survey.questions) return null // survey나 survey.questions가 없으면 아무것도 렌더링하지 않음

  // 새로운 질문 추가를 위한 모달 상태
  const [isAddQuestion, setIsAddQuestion] = useState(false)

  // 질문 삭제 핸들러
  const deleteHandler = (id) => {
    const questionToDelete = survey.questions.find(
      (question) => question.id === id,
    )
    if (
      questionToDelete.type === 'welcome' ||
      questionToDelete.type === 'thank'
    ) {
      alert('환영 및 감사 인사는 삭제할 수 없습니다.')
      return
    }

    if (!window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      return
    }

    const updatedQuestions = survey.questions
      .filter((questions) => questions.id !== id)
      .map((question, index) => ({ ...question, order: index }))

    setSurvey({ ...survey, questions: updatedQuestions })
  }

  // 질문 추가 핸들러
  const addQuestionHandler = (type) => {
    const newQuestionOrder = survey.questions.filter(
      (q) => q.type !== 'thank',
    ).length
    const newQuestion = {
      id: uuidv4(),
      title: '새 질문',
      description: '',
      type: type,
      order: newQuestionOrder,
      options: ['singleChoice', 'multipleChoice'].includes(type)
        ? ['옵션1', '옵션2']
        : [],
    }

    const updatedQuestions = [...survey.questions]
    const thankQuestionIndex = updatedQuestions.findIndex(
      (q) => q.type === 'thank',
    )

    if (thankQuestionIndex !== -1) {
      updatedQuestions.splice(thankQuestionIndex, 0, newQuestion)
      updatedQuestions[thankQuestionIndex + 1] = {
        ...updatedQuestions[thankQuestionIndex + 1],
        order: thankQuestionIndex + 1,
      }
    } else {
      updatedQuestions.push(newQuestion)
    }

    setSurvey({ ...survey, questions: updatedQuestions })

    setIsAddQuestion(false)
  }

  // 질문 추가시 타입을 고르는 모달
  const AddQuestionModal = () => {
    if (!isAddQuestion) return null
    const questionTypes = [
      { value: 'singleChoice', label: '객관식(단수)' },
      { value: 'multipleChoice', label: '객관식(복수)' },
      { value: 'freeText', label: '주관식' },
      { value: 'rating', label: '별점' },
      { value: 'link', label: '링크' },
      { value: 'info', label: '안내' },
    ]
    return (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalTitle}>추가할 질문 유형 선택</div>
          <div className={styles.modalTypes}>
            {questionTypes.map((type) => (
              <div
                key={type.value}
                className={styles.modalType}
                onClick={() => addQuestionHandler(type.value)}
              >
                {type.label}
              </div>
            ))}
          </div>
          <div className={styles.modalBottom}>
            <div
              className={styles.modalClose}
              onClick={() => setIsAddQuestion(false)}
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
    const updatedQuestions = survey.questions.map((question) =>
      question.id === id
        ? { ...question, isActive: !question.isActive }
        : question,
    )
    setSurvey({ ...survey, questions: updatedQuestions })
  }

  // 질문 수정 상태
  const [editingQuestionId, setEditingQuestionId] = useState(null)

  // 질문 수정 토글
  const toggleEditMode = (questionId) => {
    if (editingQuestionId && editingQuestionId !== questionId) {
      // 다른 질문을 편집하려고 할 때, 현재 편집 중인 질문의 변경사항을 취소합니다.
      const originalQuestion = survey.questions.find(
        (q) => q.id === editingQuestionId,
      )
      saveQuestion(originalQuestion)
    }
    setEditingQuestionId(editingQuestionId === questionId ? null : questionId)
  }

  //질문 수정 함수
  const saveQuestion = (updatedQuestion) => {
    const updatedQuestions = survey.questions.map((question) =>
      question.id === updatedQuestion.id ? updatedQuestion : question,
    )
    setSurvey({ ...survey, questions: updatedQuestions })
    setEditingQuestionId(null)
  }

  //질문 수정 취소
  const cancelEdit = () => {
    setEditingQuestionId(null)
  }

  return (
    <div className={styles.surveys}>
      {survey.questions
        .sort((a, b) => {
          if (a.type === 'welcome') return -1
          if (b.type === 'welcome') return 1
          if (a.type === 'thank') return 1
          if (b.type === 'thank') return -1
          return a.order - b.order
        })
        .map((question, index) => (
          <div
            className={`${styles.survey} ${
              editingQuestionId === question.id ? styles.editing : ''
            }`}
            key={question.id}
          >
            <div className={styles.surveyNum}>
              {question.type === 'welcome'
                ? 'hi'
                : question.type === 'thank'
                  ? 'bye'
                  : index}
            </div>
            {editingQuestionId === question.id ? (
              <div className={styles.surveyContents}>
                {question.type === 'freeText' && (
                  <EditingFreeText
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingFreeText>
                )}
                {question.type === 'singleChoice' && (
                  <EditingSingleChoice
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingSingleChoice>
                )}
                {question.type === 'multipleChoice' && (
                  <EditingMultipleChoice
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingMultipleChoice>
                )}
                {question.type === 'rating' && (
                  <EditingRating
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingRating>
                )}
                {question.type === 'link' && (
                  <EditingLink
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingLink>
                )}
                {question.type === 'info' && (
                  <EditingInfo
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingInfo>
                )}
                {question.type === 'welcome' && (
                  <EditingWelcome
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingWelcome>
                )}
                {question.type === 'thank' && (
                  <EditingThank
                    question={question}
                    onSave={(updatedQuestion) => {
                      saveQuestion(updatedQuestion)
                    }}
                    onCancel={cancelEdit}
                    questions={survey.questions}
                  ></EditingThank>
                )}
              </div>
            ) : (
              <div
                className={styles.surveyContents}
                onClick={() => toggleEditMode(question.id)}
              >
                <div className={styles.surveyQuestion}>{question.title}</div>
                <div className={styles.questionType}>{question.type}</div>
              </div>
            )}

            {question.type === 'welcome' || question.type === 'thank' ? (
              <div className={styles.questionToggle}>
                <div className={styles.label}>
                  {question.isActive ? 'On' : 'Off'}
                </div>
                <label className={styles.switch}>
                  <input
                    type='checkbox'
                    checked={question.isActive}
                    onChange={() => toggleHandler(question.id)}
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>
            ) : (
              <div className={styles.questionDelete}>
                <div
                  className={styles.label}
                  onClick={() => deleteHandler(question.id)}
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
          onClick={() => setIsAddQuestion(true)}
        >
          새 질문 추가 +
        </div>
      </div>
      {AddQuestionModal()}
    </div>
  )
}

export default Surveys
