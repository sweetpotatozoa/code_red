// Edit.js

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import usePrompt from '../../utils/usePrompt'
import BackendApis from '../../utils/backendApis'
import styles from './Edit.module.css'
import Surveys from '../../components/Surveys/Surveys'
import Triggers from '../../components/Triggers/Triggers'
import Delay from '../../components/Delay/Delay'
import SurveyPreview from '../../components/Surveys/SurveyPreview'
import { useSurvey } from '../../components/context/SurveyContext'

const Edit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { latestSurvey } = useSurvey()
  const [survey, setSurvey] = useState(latestSurvey || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [invalidSteps, setInvalidSteps] = useState({})
  const [mode, setMode] = useState('surveys')
  const [currentStepId, setCurrentStepId] = useState(null)
  const [showPreviewContainer, setShowPreviewContainer] = useState(true)
  const [editingStepId, setEditingStepId] = useState(null)

  useEffect(() => {
    if (!latestSurvey) {
      const fetchSurvey = async () => {
        try {
          const data = await BackendApis.editSurvey(id)
          setSurvey(data)
          setLoading(false)
          if (data.steps && data.steps.length > 0) {
            setCurrentStepId(data.steps[0].id)
          }
        } catch (err) {
          setError('설문조사를 불러오는데 실패했습니다.')
          setLoading(false)
        }
      }

      fetchSurvey()
    } else {
      setLoading(false)
    }
  }, [latestSurvey, id])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editingStepId && !event.target.closest(`.${styles.editing}`)) {
        setEditingStepId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [editingStepId])

  useEffect(() => {
    if (survey) {
      validateSteps()
    }
  }, [survey])

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

  const goBack = () => {
    if (window.confirm(message)) {
      navigate('/')
    }
  }

  const handleSave = async () => {
    if (Object.keys(invalidSteps).length > 0) {
      const stepNumbers = Object.values(invalidSteps)
        .map((index) => index)
        .join(', ')
      alert(`${stepNumbers}번 스텝의 '응답에 따른 이동'을 수정해주세요.`)
      return
    }
    if (!survey.steps || survey.steps.length === 0) {
      alert('설문조사에 질문을 추가해주세요.')
      return
    }
    if (!survey.triggers || survey.triggers.length === 0) {
      alert('설문조사에 트리거를 추가해주세요.')
      return
    }
    if (!survey.delay) {
      alert('설문조사에 발동주기를 추가해주세요.')
      return
    }

    try {
      await BackendApis.updateSurvey(id, survey)
      alert('설문조사가 성공적으로 저장되었습니다.')
      setSurvey({ ...survey, isDeploy: false })
    } catch (err) {
      alert('설문조사 저장에 실패했습니다.')
    }
  }

  const handleDeploy = async () => {
    if (Object.keys(invalidSteps).length > 0) {
      const stepNumbers = Object.values(invalidSteps)
        .map((index) => index)
        .join(', ')
      alert(`${stepNumbers}번 스텝의 '응답에 따른 이동'을 수정해주세요.`)
      return
    }
    if (!survey.steps || survey.steps.length === 0) {
      alert('설문조사에 질문을 추가해주세요.')
      return
    }
    if (!survey.triggers || survey.triggers.length === 0) {
      alert('설문조사에 트리거를 추가해주세요.')
      return
    }
    if (!survey.delay) {
      alert('설문조사에 발동주기를 추가해주세요.')
      return
    }

    try {
      await BackendApis.deploySurvey(id, survey)
      setSurvey({ ...survey, isDeploy: true })
      alert('설문조사가 성공적으로 배포되었습니다.')
    } catch (err) {
      alert('설문조사 배포에 실패했습니다.')
    }
  }

  const renderMain = () => {
    if (loading) return <div>로딩 중...</div>
    if (error) return <div>{error}</div>
    if (!survey) return <div>설문조사를 찾을 수 없습니다.</div>

    switch (mode) {
      case 'surveys':
        return (
          <Surveys
            survey={survey}
            setSurvey={setSurvey}
            invalidSteps={invalidSteps}
            setInvalidSteps={setInvalidSteps}
            editingStepId={editingStepId}
            setEditingStepId={setEditingStepId}
          />
        )
      case 'triggers':
        return <Triggers survey={survey} setSurvey={setSurvey} />
      case 'delays':
        return <Delay survey={survey} setSurvey={setSurvey} />
      default:
        return null
    }
  }

  const refreshPreview = () => {
    if (survey && survey.steps.length > 0) {
      setCurrentStepId(survey.steps[0].id)
      setShowPreviewContainer(true)
    }
  }

  const message =
    '저장하지 않은 내용은 사라질 수 있습니다. 정말 나가시겠습니까?'

  const handleBeforeUnload = useCallback(
    (event) => {
      event.preventDefault()
      event.returnValue = message
    },
    [message],
  )

  usePrompt(message, true)

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handleBeforeUnload])

  const handleTitleChange = (e) => {
    setSurvey({ ...survey, title: e.target.value })
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerPart}>
          <div className={styles.bigButton} onClick={goBack}>
            ◀︎ 메인으로
          </div>
          <input
            className={styles.titleInput}
            value={survey ? survey.title : '설문조사 제목'}
            onChange={handleTitleChange}
          ></input>
        </div>
        <div className={styles.headerPart}>
          {survey && (
            <div
              className={`${styles.isDeploy} ${
                survey.isDeploy ? styles.greenText : styles.redText
              }`}
            >
              게시상태
              <div
                className={`${styles.isDeployCircle} ${
                  survey.isDeploy ? styles.greenCircle : styles.redCircle
                }`}
              ></div>
            </div>
          )}
          <div className={styles.bigButton} onClick={handleSave}>
            저장하기
          </div>
          <div className={styles.bigButtonBlack} onClick={handleDeploy}>
            게시하기
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.settings}>
            <div
              className={`${styles.setting} ${
                mode === 'surveys' ? styles.active : ''
              }`}
              onClick={() => setMode('surveys')}
            >
              스텝 구성
            </div>
            <div
              className={`${styles.setting} ${
                mode === 'triggers' ? styles.active : ''
              }`}
              onClick={() => setMode('triggers')}
            >
              트리거 구성
            </div>
            <div
              className={`${styles.setting} ${
                mode === 'delays' ? styles.active : ''
              }`}
              onClick={() => setMode('delays')}
            >
              발동주기 구성
            </div>
          </div>
          {renderMain()}
        </div>
        <div className={styles.display}>
          <div className={styles.website}>
            <div className={styles.top}>
              <img
                src='/images/mac.svg'
                className={styles.macButton}
                alt='Mac button'
              />
              <div className={styles.yourWeb}>나의 서비스</div>
            </div>
            {survey && (
              <SurveyPreview
                selectedTemplate={survey}
                currentStepId={currentStepId}
                setCurrentStepId={setCurrentStepId}
                showContainer={showPreviewContainer}
                setShowContainer={setShowPreviewContainer}
              />
            )}
          </div>
          <div className={styles.bottom}>
            <div className={styles.bigButton} onClick={refreshPreview}>
              새로고침
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Edit
