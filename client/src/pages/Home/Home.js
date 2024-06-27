import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import { useEffect, useState } from 'react'

import data from '../../utils/data'
import customerData from '../../utils/customerData'

const Home = () => {
  const [surveys, setSurveys] = useState(data)
  const [customerInfo, setCustomerInfo] = useState(customerData)
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    customerInfo.surveyPosition || 4,
  )

  const navigate = useNavigate()

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

  //설정 모달 취소하기
  const settingCancelHandler = () => {
    setIsSetting(false)
    setSelectedPosition(customerInfo.surveyPosition || 4)
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

  //요약 페이지로 가기
  const goToSummary = (surveyId) => {
    navigate(`/summary/${surveyId}`)
  }

  useEffect(() => {
    setSurveys(data)
    setCustomerInfo(customerData)
  }, [])

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
          <div className={styles.button} onClick={newSurveyHandler}>
            새 설문조사 +
          </div>
        </div>
        <div className={styles.surveys}>
          <div className={styles.descriptions}>
            <div className={styles.description1}>제목</div>
            <div className={styles.description2}>수정날짜</div>
            <div className={styles.description3}>배포상태</div>
          </div>

          {surveys.map((survey) => (
            <div
              key={survey.id}
              className={styles.surveyBox}
              // onClick={() => goToSummary(survey.id)}
            >
              <div className={styles.surveyTitle}>{survey.title}</div>
              <div className={styles.surveyDate}>{survey.updatedAt}</div>
              <div className={styles.surveyStatus}>
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
              </div>
              <div
                className={styles.surveyEdit}
                onClick={() => handleEdit(survey.id)}
              >
                수정
              </div>
              <div
                className={styles.surveyDelete}
                onClick={() => surveyDeleteHandler(survey.id)}
              >
                삭제
              </div>
            </div>
          ))}
        </div>
      </div>
      {isSetting && (
        <div className={styles.modalBackground}>
          <div className={styles.settingModal}>
            <div className={styles.title}>설문조사 위치설정</div>
            <select
              className={styles.select}
              onChange={(e) => setSelectedPosition(e.target.value)}
              value={selectedPosition}
            >
              <option value='4'>우측 하단</option>
              <option value='1'>좌측 하단</option>
              <option value='2'>좌측 상단</option>
              <option value='3'>우측 상단</option>
            </select>
            <div className={styles.bottom}>
              <div className={styles.btnButton2} onClick={settingCancelHandler}>
                취소
              </div>
              <div className={styles.btnButton} onClick={settingSaveHandler}>
                저장
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Home
