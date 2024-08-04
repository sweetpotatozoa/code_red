import styles from './Templates.module.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import backendApis from '../../utils/backendApis'
import TemplatePreview from '../../components/TemplatePreview/TemplatePreview'

const Templates = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentStepId, setCurrentStepId] = useState(null)
  const [showContainer, setShowContainer] = useState(true)

  // 뒤로가기 버튼
  const goBack = () => {
    navigate('/')
  }

  // 템플릿 1차 선택(미리보기)
  const templateClickHandler = (template) => {
    setSelectedTemplate(template)
    setCurrentStepId(template.steps[0].id) // 첫 번째 스텝의 ID로 설정
    setShowContainer(true)
  }

  // 템플릿 고르고 선택하기 버튼 눌러서 실제로 설문조사 생성하면서 edit페이지로 이동
  const createSurvey = async () => {
    if (selectedTemplate) {
      try {
        const surveyId = await backendApis.createSurvey(selectedTemplate.id)
        navigate(`/edit/${surveyId}`)
      } catch (error) {
        console.error('설문조사 생성 실패', error)
        alert('설문조사 생성에 실패했습니다.')
      }
    }
  }

  // 새로고침
  const handleRefresh = () => {
    if (selectedTemplate && selectedTemplate.steps.length > 0) {
      setCurrentStepId(selectedTemplate.steps[0].id)
    }
    setShowContainer(true)
  }

  //템플릿 가져오기
  useEffect(() => {
    const getTemplates = async () => {
      try {
        const result = await backendApis.getTemplates()
        setTemplates(result)
        if (result.length > 0) {
          setSelectedTemplate(result[0])
          setCurrentStepId(result[0].steps[0].id) // 첫 번째 템플릿의 첫 번째 스텝 ID로 설정
        }
      } catch (error) {
        console.error('템플릿 가져오기 실패', error)
        alert('템플릿 가져오기에 실패했습니다.')
      }
    }
    getTemplates()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton} onClick={goBack}>
          ◀︎ 뒤로가기
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.titleContainer}>
            <div className={styles.mainTitle}>템플릿 선택하기</div>
          </div>
          <div className={styles.options}>
            {templates.map((template) => (
              <div
                className={`${styles.option} ${
                  selectedTemplate === template ? styles.selected : ''
                }`}
                key={template.id}
                onClick={() => templateClickHandler(template)}
              >
                <div className={styles.optionTitle}>{template.title}</div>
                <div className={styles.optionContent}>
                  {template.description}
                </div>
                {selectedTemplate === template && (
                  <div className={styles.smallBottom}>
                    <div className={styles.button} onClick={createSurvey}>
                      선택하기
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
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
            {selectedTemplate && (
              <TemplatePreview
                selectedTemplate={selectedTemplate}
                currentStepId={currentStepId}
                setCurrentStepId={setCurrentStepId}
                showContainer={showContainer}
                setShowContainer={setShowContainer}
              />
            )}
          </div>
          <div className={styles.bottom}>
            <div className={styles.bigButton} onClick={handleRefresh}>
              새로고침
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
