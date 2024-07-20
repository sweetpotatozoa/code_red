import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toZonedTime, format } from 'date-fns-tz'
import styles from './Responses.module.css'
import BackendApis from '../../utils/backendApis'

const Responses = () => {
  const [userInfo, setUserInfo] = useState('')
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(4)
  const [responses, setResponses] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [survey, setSurvey] = useState({ isDeploy: false })
  const [isDownloading, setIsDownloading] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [surveyData, responsesData, userInfoData] = await Promise.all([
          BackendApis.getSurvey(id),
          BackendApis.getResponse(id),
          BackendApis.getUserInfo(),
        ])
        setSurvey(surveyData || { isDeploy: false })
        setResponses(responsesData)
        setUserInfo(userInfoData)
        setSelectedPosition(userInfoData.surveyPosition || 4)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const deleteResponse = async (responseId) => {
    if (window.confirm('정말로 이 응답을 삭제하시겠습니까?')) {
      try {
        await BackendApis.deleteResponse(responseId)
        setResponses(
          responses.filter((response) => response._id !== responseId),
        )
        alert('응답이 성공적으로 삭제되었습니다.')
      } catch (error) {
        console.error('Error deleting response:', error)
        alert('응답 삭제 중 오류가 발생했습니다.')
      }
    }
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

  const settingCancelHandler = () => {
    setIsSetting(false)
    setSelectedPosition(userInfo.surveyPosition || 4)
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

  const goToSummary = () => {
    navigate(`/summary/${id}`)
  }

  const goToHome = () => {
    navigate('/')
  }

  const formatKoreanTime = (utcTime) => {
    const kstDate = toZonedTime(utcTime, 'Asia/Seoul')
    return format(kstDate, 'yyyy-MM-dd HH:mm:ss', { timeZone: 'Asia/Seoul' })
  }

  const downloadCSV = async () => {
    try {
      const response = await BackendApis.downloadResponses(id)

      console.log('Response type:', typeof response)
      console.log('Response content:', response)

      if (response instanceof Blob) {
        // 응답이 Blob 형식인 경우 (기대하는 형식)
        const url = window.URL.createObjectURL(response)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `survey_responses_${id}.csv`)
        document.body.appendChild(link)
        link.click()
        link.parentNode.removeChild(link)
      } else if (typeof response === 'object' && response !== null) {
        // 응답이 JSON 객체인 경우 (에러 메시지 등)
        console.error('Server returned an error:', response)
        alert(
          `CSV 다운로드에 실패했습니다: ${
            response.message || '알 수 없는 오류'
          }`,
        )
      } else {
        console.error('Unexpected response format:', response)
        alert('CSV 다운로드에 실패했습니다: 알 수 없는 응답 형식')
      }
    } catch (error) {
      console.error('Error downloading CSV:', error)
      alert('CSV 다운로드 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>
  if (error) return <div className={styles.error}>{error}</div>
  if (!survey)
    return <div className={styles.error}>설문조사를 찾을 수 없습니다.</div>

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <img
          src='/images/logo.svg'
          onClick={goToHome}
          className={styles.logo}
        />
        <div className={styles.navBar}>
          <div className={styles.nav} onClick={goToHome}>
            설문조사
          </div>
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
          <div className={styles.connect}>
            연결상태 {userInfo.isConnect ? '정상' : '비정상'}
          </div>
          <a
            href='https://zenith-income-03c.notion.site/1-079333926e1c44899b4d44ab50a98a83/'
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
                checked={survey?.isDeploy}
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
          <div className={styles.navs} onClick={goToSummary}>
            전체 요약
          </div>
          <div className={styles.selectedNavs}>개별 응답</div>
        </div>
        <div className={styles.download}>
          <button
            className={styles.downloadButton}
            onClick={downloadCSV}
            disabled={isDownloading || responses.length === 0}
          >
            {isDownloading ? 'Downloading...' : 'CSV 다운로드'}
          </button>
        </div>
        <div className={styles.responses}>
          {responses.length > 0 ? (
            responses.map((response) => (
              <div className={styles.response} key={response._id}>
                <div className={styles.responseTitle}>
                  {formatKoreanTime(response.createAt)}
                </div>
                <div className={styles.contents}>
                  {response.answers.map((a) => (
                    <div className={styles.content} key={a.stepId}>
                      <div className={styles.stepTitle}>{a.stepTitle}</div>
                      <div className={styles.answerValue}>
                        {Array.isArray(a.answer)
                          ? a.answer.map((ans) => ans.value).join(', ')
                          : a.answer.value || a.answer}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.isComplete}>
                  {response.isComplete ? '제출완료' : '중도이탈'}
                </div>
                <div className={styles.bottom}>
                  <button
                    className={styles.btnButton}
                    onClick={() => deleteResponse(response._id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResponses}>아직 응답이 없습니다.</div>
          )}
        </div>
      </div>
      {isSetting && (
        <div className={styles.modalBackground}>
          <div className={styles.settingModal}>
            <div className={styles.title}>설문조사 위치설정</div>
            <select
              className={styles.select}
              onChange={(e) => setSelectedPosition(Number(e.target.value))}
              value={selectedPosition}
            >
              <option value={4}>우측 하단</option>
              <option value={1}>좌측 하단</option>
              <option value={2}>좌측 상단</option>
              <option value={3}>우측 상단</option>
            </select>
            <div className={styles.bottom}>
              <button
                className={styles.btnButton2}
                onClick={settingCancelHandler}
              >
                취소
              </button>
              <button className={styles.btnButton} onClick={settingSaveHandler}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Responses
