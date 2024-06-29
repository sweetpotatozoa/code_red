import styles from './Edit.module.css'
import Surveys from '../../components/Surveys/Surveys'
import Triggers from '../../components/Triggers/Triggers'
import Delay from '../../components/Delay/Delay'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import BackendApis from '../../utils/backendApis'

const Edit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [survey, setSurvey] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const data = await BackendApis.editSurvey(id)
        setSurvey(data)
        setLoading(false)
      } catch (err) {
        setError('설문조사를 불러오는데 실패했습니다.')
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [id])

  const [mode, setMode] = useState('surveys')

  // 뒤로가기
  const goBack = () => {
    navigate(-1)
  }

  // 저장하기
  const handleSave = async () => {
    try {
      await BackendApis.updateSurvey(id, survey)
      alert('설문조사가 성공적으로 저장되었습니다.')
    } catch (err) {
      alert('설문조사 저장에 실패했습니다.')
    }
  }

  // 배포하기
  const handleDeploy = async () => {
    try {
      await BackendApis.deploySurvey(id, survey)
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
        return <Surveys survey={survey} setSurvey={setSurvey} />
      case 'triggers':
        return <Triggers survey={survey} setSurvey={setSurvey} />
      case 'delays':
        return <Delay survey={survey} setSurvey={setSurvey} />
      default:
        return null
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerPart}>
          <div className={styles.bigButton} onClick={goBack}>
            ◀︎ 뒤로가기
          </div>
          <div className={styles.title}>
            {survey ? survey.title : '설문조사 제목'}
          </div>
        </div>
        <div className={styles.headerPart}>
          <div className={styles.bigButton} onClick={handleSave}>
            저장하기
          </div>
          <div className={styles.bigButtonBlack} onClick={handleDeploy}>
            배포하기
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
              질문 구성
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
                src='/images/mac.png'
                className={styles.macButton}
                alt='Mac button'
              />
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

export default Edit
