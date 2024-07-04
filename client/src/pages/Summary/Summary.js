import { useNavigate } from 'react-router-dom'
import styles from './Summary.module.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import BackendApis from '../../utils/backendApis'

import SummaryFreeText from '../../components/Summaries/SummaryFreeText'
import SummaryRating from '../../components/Summaries/SummaryRating'
import SummarySingleChoice from '../../components/Summaries/SummarySingleChoice'
import SummaryWelcome from '../../components/Summaries/SummaryWelcome'
import SummaryMultipleChoice from '../../components/Summaries/SummaryMultipleChoice'
import SummaryInfo from '../../components/Summaries/SummaryInfo'
import SummaryLink from '../../components/Summaries/SummaryLink'

const Summary = () => {
  const [userInfo, setUserInfo] = useState('')
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(4)
  const [summaryData, setSummaryData] = useState(null)
  const [surveyQuestions, setSurveyQuestions] = useState([])
  const [survey, setSurvey] = useState({ isDeploy: false })

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [surveyData, summaryData, questionsData, userInfoData] =
          await Promise.all([
            BackendApis.getSurvey(id),
            BackendApis.getSurveySummary(id),
            BackendApis.getSurveyQuestions(id),
            BackendApis.getUserInfo(),
          ])
        setSurvey(surveyData || { isDeploy: false })
        setSummaryData(summaryData)
        setSurveyQuestions(questionsData)
        setUserInfo(userInfoData)
        setSelectedPosition(userInfoData.surveyPosition || 4)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const settingCancelHandler = () => {
    setIsSetting(false)
    setSelectedPosition(userInfo.surveyPosition || 4)
  }

  const surveyDeployHandler = async () => {
    if (!survey) return

    try {
      await BackendApis.toggleSurveyDeploy(survey._id)
      setSurvey((prevSurvey) => ({
        ...prevSurvey,
        isDeploy: !prevSurvey.isDeploy,
      }))
    } catch (error) {
      console.error('설문조사 배포상태 변경 실패', error)
      alert('설문조사 배포상태 변경에 실패했습니다.')
    }
  }

  const handleEdit = (surveyId) => {
    navigate(`/edit/${surveyId}`)
  }

  const settingSaveHandler = async () => {
    const newUserInfo = {
      ...userInfo,
      surveyPosition: selectedPosition,
    }

    try {
      await BackendApis.editSurveyPosition('PUT', {
        surveyPosition: selectedPosition,
      })
      setUserInfo(newUserInfo)
      setIsSetting(false)
    } catch (error) {
      console.error('설정 저장 실패', error)
      alert('설정 저장에 실패했습니다.')
    }
  }

  const goToResponses = () => {
    navigate(`/responses/${id}`)
  }

  const goToHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <img
          src='/images/logo.png'
          className={styles.logo}
          onClick={goToHome}
        />
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
          <div className={styles.setting}>연결상태 정상</div>
          <a
            href='https://www.naver.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <div className={styles.setting}>가이드</div>
          </a>
        </div>
        <div className={styles.titleBox}>
          <div className={styles.title}>설문조사</div>
          <div className={styles.surveySettingBox}>
            <div className={styles.toggle}>
              {survey?.isDeploy ? 'On' : 'Off'}
            </div>
            <label className={styles.switch}>
              <input
                type='checkbox'
                checked={survey.isDeploy || false}
                onChange={surveyDeployHandler}
              />
              <span className={`${styles.slider} ${styles.round}`}></span>
            </label>
            <div className={styles.button} onClick={() => handleEdit(id)}>
              수정하기
            </div>
          </div>
        </div>
        <div className={styles.smallNavs}>
          <div className={styles.selectedNavs}>전체 요약</div>
          <div className={styles.navs} onClick={goToResponses}>
            개별 응답
          </div>
        </div>
        <div className={styles.contents}>
          <div className={styles.summaries}>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>노출</div>
              </div>
              <div className={styles.summaryNum}>
                {summaryData?.views || '-'}
              </div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>시작</div>
                <div className={styles.percent}>
                  {summaryData ? `${summaryData.exposureStartRatio}%` : '-'}
                </div>
              </div>
              <div className={styles.summaryNum}>
                {summaryData?.startCount || '-'}
              </div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>응답완료</div>
                <div className={styles.percent}>
                  {summaryData ? `${summaryData.exposureCompletedRatio}%` : '-'}
                </div>
              </div>
              <div className={styles.summaryNum}>
                {summaryData?.completedCount || '-'}
              </div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>이탈</div>
                <div className={styles.percent}>
                  {summaryData ? `${summaryData.exposureDropoutRatio}%` : '-'}
                </div>
              </div>
              <div className={styles.summaryNum}>
                {summaryData?.dropoutCount || '-'}
              </div>
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryTitle}>
                <div>평균 응답 완료시간</div>
              </div>
              <div className={styles.summaryNum}>
                {summaryData?.avgResponseTime
                  ? `${summaryData.avgResponseTime} 초`
                  : '-'}
              </div>
            </div>
          </div>
          <div className={styles.steps}>
            {surveyQuestions.map((question) => {
              switch (question.type) {
                case 'welcome':
                  return <SummaryWelcome key={question.id} data={question} />
                case 'freeText':
                  return <SummaryFreeText key={question.id} data={question} />
                case 'rating':
                  return <SummaryRating key={question.id} data={question} />
                case 'singleChoice':
                  return (
                    <SummarySingleChoice key={question.id} data={question} />
                  )
                case 'multipleChoice':
                  return (
                    <SummaryMultipleChoice key={question.id} data={question} />
                  )
                case 'info':
                  return <SummaryInfo key={question.id} data={question} />
                case 'link':
                  return <SummaryLink key={question.id} data={question} />
                default:
                  return null
              }
            })}
          </div>
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

export default Summary
