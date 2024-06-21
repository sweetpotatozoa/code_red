import { useNavigate } from 'react-router-dom'
import styles from './Responses.module.css'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import data from '../../utils/data'
import customerData from '../../utils/customerData'
import responsesData from '../../utils/responsesData'

const Responses = () => {
  const [surveys, setSurveys] = useState(data)
  const [customerInfo, setCustomerInfo] = useState(customerData)
  const [isSetting, setIsSetting] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState(
    customerInfo.surveyPosition || 4,
  )
  const [responses, setResponses] = useState(responsesData)

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

  //개별응답으로 이동
  const goToSummary = () => {
    navigate(`/summary/${survey.id}`)
  }

  //개별응답 삭제
  const deleteResponse = (responseId) => {
    const newResponses = responses.filter(
      (response) => response.id !== responseId,
    )
    setResponses(newResponses)
  }

  //홈페이지로 이동
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
        ></img>
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
          <div className={styles.navs} onClick={goToSummary}>
            전체 요약
          </div>
          <div className={styles.selectedNavs}>개별 응답</div>
        </div>
        <div className={styles.download}>
          <div className={styles.downloadButton}>CSV 다운로드</div>
        </div>
        <div className={styles.responses}>
          {responses.map((response) => (
            <div className={styles.response} key={response.id}>
              <div className={styles.responseTitle}>{response.createAt}</div>
              <div className={styles.contents}>
                {
                  //질문과 답변을 렌더링하는 부분
                  response.answers.map((a) => (
                    <div className={styles.content} key={a.questionId}>
                      <div className={styles.stepTitle}>{a.questionTitle}</div>
                      <div className={styles.answerValue}>{a.answer}</div>
                    </div>
                  ))
                }
              </div>
              <div className={styles.isComplete}>
                {response.isComplete ? '제출완료' : '중도이탈'}
              </div>
              <div className={styles.bottom}>
                <div
                  className={styles.btnButton}
                  onClick={() => deleteResponse(response.id)}
                >
                  삭제
                </div>
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
              <div className={styles.btnButton2} onClick={settingModalHandler}>
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
export default Responses
