import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import { useEffect, useState } from 'react'

import backendApis from '../../utils/backendApis'

const Home = () => {
  const [surveys, setSurveys] = useState([])
  const [userInfo, setUserInfo] = useState('')
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    userInfo.surveyPosition || 4,
  )

  const navigate = useNavigate()

  useEffect(() => {
    const initializeData = async () => {
      try {
        // 인증 상태 확인
        const authResult = await backendApis.checkAuth()
        if (!authResult || !authResult.isAuthenticated) {
          navigate('/login')
          return
        }

        // 인증된 경우, 데이터 로드
        const result = await backendApis.getSurveys()
        setSurveys(result)
        const customerInfo = await backendApis.getUserInfo()
        setUserInfo(customerInfo)
      } catch (error) {
        console.error('Error initializing data:', error)
        navigate('/login')
      }
    }
    initializeData()
  }, [navigate])

  //설문조사 수정하기
  const handleEdit = (surveyId) => {
    navigate(`/edit/${surveyId}`)
  }
  //새 설문조사 만들기
  const newSurveyHandler = () => {
    navigate('/templates')
  }

  //설정 모달 취소하기
  const settingCancelHandler = () => {
    setIsSetting(false)
    setSelectedPosition(userInfo.surveyPosition || 4)
  }

  //화면 설정 저장하기
  const settingSaveHandler = async () => {
    const newUserInfo = {
      ...userInfo,
      surveyPosition: selectedPosition,
    }

    try {
      await backendApis.editSurveyPosition('PUT', {
        surveyPosition: selectedPosition,
      })
      setUserInfo(newUserInfo)
      setIsSetting(false)
    } catch (error) {
      console.error('설정 저장 실패', error)
      alert('설정 저장에 실패했습니다.')
    }
  }

  //설문조사 삭제하기
  const surveyDeleteHandler = async (surveyId) => {
    if (!window.confirm('정말로 설문조사를 삭제하시겠습니까?')) return
    try {
      await backendApis.deleteSurvey(surveyId)
      const newSurveys = surveys.filter((survey) => survey._id !== surveyId)
      setSurveys(newSurveys)
    } catch (error) {
      console.error('설문조사 삭제 실패', error)
      alert('설문조사 삭제에 실패했습니다.')
    }
  }

  //설문조사 배포상태 변경하기
  const surveyDeployHandler = async (surveyId) => {
    try {
      await backendApis.toggleSurveyDeploy(surveyId)
      const newSurveys = surveys.map((survey) => {
        if (survey._id === surveyId) {
          survey.isDeploy = !survey.isDeploy
        }
        return survey
      })
      setSurveys(newSurveys)
    } catch (error) {
      console.error('설문조사 배포상태 변경 실패', error)
      alert('설문조사 배포상태 변경에 실패했습니다.')
    }
  }

  //요약 페이지로 가기
  const goToSummary = (surveyId) => {
    navigate(`/summary/${surveyId}`)
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
            {userInfo.realName}님!
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
          <div className={styles.setting}>
            연결상태 {userInfo.isConnect ? '정상' : '비정상'}
          </div>
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
              key={survey._id}
              className={styles.surveyBox}
              onClick={() => goToSummary(survey._id)}
            >
              <div className={styles.surveyTitle}>{survey.title}</div>
              <div className={styles.surveyDate}>{survey.updateAt}</div>
              <div className={styles.surveyStatus}>
                <div className={styles.toggle}>
                  {survey.isDeploy ? 'On' : 'Off'}
                </div>
                <label
                  className={styles.switch}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type='checkbox'
                    checked={survey.isDeploy}
                    onChange={(e) => {
                      surveyDeployHandler(survey._id)
                      e.stopPropagation()
                    }}
                  />
                  <span className={`${styles.slider} ${styles.round}`}></span>
                </label>
              </div>
              <div
                className={styles.surveyEdit}
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(survey._id)
                }}
              >
                수정
              </div>
              <div
                className={styles.surveyDelete}
                onClick={(e) => {
                  e.stopPropagation()
                  surveyDeleteHandler(survey._id)
                }}
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
