import { useNavigate } from 'react-router-dom'
import styles from './Summary.module.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import data from '../../utils/data'
import customerData from '../../utils/customerData'

const Summary = () => {
  const [surveys, setSurveys] = useState(data)
  const [customerInfo, setCustomerInfo] = useState(customerData)
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    customerInfo.surveyPosition || 4,
  )

  const navigate = useNavigate()

  useEffect(() => {
    setSurveys(data)
    setCustomerInfo(customerData)
  }, [])

  //설문조사 불러오기
  const { id } = useParams()
  const survey = surveys.find((survey) => survey.id === parseInt(id))

  //설문조사 수정하기
  const handleEdit = (surveyId) => {
    navigate(`/edit/${surveyId}`)
  }

  const newSurveyHandler = () => {
    navigate('/templates')
  }

  //설문조사 삭제하기
  const surveyDeleteHandler = (surveyId) => {
    if (!window.confirm('정말로 설문조사를 삭제하시겠습니까?')) return
    const newSurveys = surveys.filter((survey) => survey.id !== surveyId)
    setSurveys(newSurveys)
  }

  //설문조사 켜기/끄기
  const surveyDeployHandler = (surveyId) => {
    const newSurveys = surveys.map((survey) => {
      if (survey.id === surveyId) {
        survey.isDeploy = !survey.isDeploy
      }
      return survey
    })
    setSurveys(newSurveys)
  }

  //설정 모달 켜기/끄기
  const settingModalHandler = () => {
    setIsSetting(!isSetting)
  }

  //화면 설정 저장하기
  const settingSaveHandler = () => {
    const newCustomerInfo = {
      ...customerInfo,
      surveyPosition: selectedPosition,
    }
    setCustomerInfo(newCustomerInfo)
    setIsSetting(false)
  }

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <img src='/images/logo.png' className={styles.logo}></img>
        <div className={styles.navBar}>
          <div className={styles.nav}>설문조사</div>
        </div>
        <div className={styles.user}>
          <div className={styles.welcome}>
            안녕하세요,
            <br />
            {customerInfo.customerName}님!
          </div>
          <div
            className={styles.environmentSetting}
            onClick={() => setIsSetting(!isSetting)}
          >
            설정
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.basicSetting}>
          <div className={styles.setting}>연결상태 정상</div>
          <a href='https://www.naver.com/' target='_blank'>
            <div className={styles.setting}>가이드</div>
          </a>
        </div>
        <div className={styles.titleBox}>
          <div className={styles.title}>설문조사</div>
          <div className={styles.surveySettingBox}>
            <div className={styles.toggle}>
              {survey.isDeploy ? 'On' : 'Off'}
            </div>
            <label className={styles.switch}>
              <input
                type='checkbox'
                checked={survey.isDeploy}
                onChange={() => surveyDeployHandler(survey.id)}
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
            <div
              className={styles.button}
              onClick={() => handleEdit(parseInt(id))}
            >
              수정하기
            </div>
          </div>
        </div>
        <div className={styles.smallNavs}>
          <div className={styles.selectedNavs}>전체 요약</div>
          <div className={styles.navs}>개별 응답</div>
        </div>
        <div className={styles.contents}>
          <div className={styles.summaries}>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>노출</div>
                <div className={styles.percent}>50%</div>
              </div>
              <div className={styles.summaryNum}>1</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>시작</div>
                <div className={styles.percent}>50%</div>
              </div>
              <div className={styles.summaryNum}>1</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>응답완료</div>
                <div className={styles.percent}>50%</div>
              </div>
              <div className={styles.summaryNum}>1</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>이탈</div>
                <div className={styles.percent}>50%</div>
              </div>
              <div className={styles.summaryNum}>1</div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>평균 응답 소요시간</div>
              </div>
              <div className={styles.summaryNum}>1</div>
            </div>
          </div>
          <div className={styles.download}>
            <div className={styles.downloadButton}>다운로드</div>
          </div>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepTitle}>설문조사 제목</div>
              <div className={styles.stepContent}>{survey.title}</div>
            </div>
            <div className={styles.step}></div>
            <div className={styles.step}></div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Summary
