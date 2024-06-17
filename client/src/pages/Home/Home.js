import { useNavigate } from 'react-router-dom'
import styles from './Home.module.css'
import { useEffect, useState } from 'react'

const Home = () => {
  const data = [
    {
      id: 1,
      title: '심층 인터뷰 요청',
      createAt: '2021.10.10',
      updatedAt: '2021.10.11',
      isDeploy: true,
      customerId: 1,
    },
    {
      id: 2,
      title: '제품 만족도 조사',
      createAt: '2021.10.10',
      updatedAt: '2021.10.15',
      isDeploy: true,
      customerId: 1,
    },
    {
      id: 3,
      title: '고객 세그먼트 조사',
      createAt: '2021.10.10',
      updatedAt: '2021.10.12',
      isDeploy: true,
      customerId: 1,
    },
    {
      id: 4,
      title: '이탈방지',
      createAt: '2021.10.10',
      createdAt: '2021.10.13',
      isDeploy: true,
      customerId: 2,
    },
  ]

  const [surveys, setSurveys] = useState(data)
  const navigrate = useNavigate()
  const handleEdit = (surveyId) => {
    navigrate(`/edit/${surveyId}`)
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
            안녕하세요,<br></br>
            @@@님!
          </div>
          <div className={styles.environmentSetting}>설정</div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.basicSetting}>
          <div className={styles.setting}>연결상태 정상</div>
          <div className={styles.setting}>가이드</div>
        </div>
        <div className={styles.titleBox}>
          <div className={styles.title}>설문조사</div>
          <div className={styles.button}>새 설문조사 +</div>
        </div>
        <div className={styles.surveys}>
          <div className={styles.descriptions}>
            <div className={styles.description1}>제목</div>
            <div className={styles.description2}>수정날짜</div>
          </div>

          {surveys.map((survey) => (
            <div className={styles.surveyBox}>
              <div className={styles.surveyTitle}>{survey.title}</div>
              <div className={styles.surveyDate}>{survey.createAt}</div>
              <div className={styles.surveyStatus}>
                {survey.isDeploy ? '켜짐' : '꺼짐'}
              </div>
              <div
                className={styles.surveyEdit}
                onClick={() => handleEdit(survey.id)}
              >
                수정
              </div>
              <div className={styles.surveyDelete}>삭제</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Home
