import styles from './Templates.module.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import templatesData from '../../utils/templatesData'

const Templates = () => {
  const navigate = useNavigate()

  // 뒤로가기 버튼
  const goBack = () => {
    navigate('/')
  }
  const [templates, setTemplates] = useState(templatesData)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // 템플릿 1차 선택시
  const templateClickHandler = (template) => {
    setSelectedTemplate(template)
  }

  // 템플릿 고르고 선택하기 버튼 눌러서 실제로 설문조사 생성하면서 edit페이지로 이동
  const createSurvey = () => {
    if (selectedTemplate) {
      navigate('/edit/1')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton} onClick={goBack}>
          ◀︎ 뒤로가기
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.mainTitle}>새 설문조사 만들기</div>
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
              <img src='/images/mac.png' className={styles.macButton}></img>
              <div className={styles.yourWeb}>나의 서비스</div>
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.bigButton}>새로고침</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
