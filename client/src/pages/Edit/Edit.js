import styles from './Edit.module.css'
import Surveys from '../../components/Surveys/Surveys'
import Triggers from '../../components/Triggers/Triggers'
import Delay from '../../components/Delay/Delay'
import { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

const surveys = [
  {
    id: '1',
    title: '설문조사 제목',
    createAt: '2021.10.10',
    isDeploy: true,
    questions: [
      {
        id: 1,
        order: 0,
        type: 'welcome',
        title: '저희 서비스 이용이 처음이시군요!',
        description: '설문조사에 참여해주실래요?',
        isActive: true,
      },
      {
        id: 2,
        order: 1,
        type: 'singleChoice',
        title: '회사에서의 역할은 무엇입니까?',
        description: '솔직하게 응답해주세요',
        options: [
          {
            id: 1,
            value: 'CEO',
            nextQuestionId: 3,
          },
          {
            id: 2,
            value: 'CTO',
            nextQuestionId: 3,
          },
          {
            id: 3,
            value: 'CFO',
            nextQuestionId: 3,
          },
          {
            id: 4,
            value: 'CPO',
            nextQuestionId: 3,
          },
        ],
      },
      {
        id: 3,
        order: 2,
        type: 'link',
        title: '세상에 대표님이시군요!',
        description: '아래 링크를 눌러 제발 저희와 인터뷰 일정을 잡아주세요',
        url: 'https://www.naver.com',
      },
      {
        id: 4,
        order: 3,
        type: 'freeText',
        title: '와! 개발자시군요!',
        description: '저희 제품에 대한 피드백을 주세요.',
        nextQuestionId: 5,
      },
      {
        id: 5,
        order: 4,
        type: 'rating',
        title: 'CFO라구요?',
        description: '저희 제품의 가격에 대해 어떻게 생각하세요?',
      },
      {
        id: 6,
        order: 5,
        type: 'multipleChoice',
        title: 'CPO라니!',
        description: '저희 제품을 사용하시는 이유가 뭐죠?',
        nextQuestionId: 7,
        options: [
          {
            id: 1,
            value: '기능',
          },
          {
            id: 2,
            value: '디자인',
          },
          {
            id: 3,
            value: '가격',
          },
          {
            id: 4,
            value: '편의성',
          },
        ],
      },
      {
        id: 7,
        order: 6,
        type: 'thank',
        title: '수고하셨습니다!',
        description: '설문조사에 참여해주셔서 감사합니다.',
        isActive: true,
      },
    ],
    triggers: [
      {
        id: 1,
        type: 'firstVisit',
        title: '첫 방문',
        description: '처음으로 방문했을 때',
      },
      {
        id: 2,
        type: 'click',
        title: '클릭',
        description: '클릭했을 때',
      },
      {
        id: 3,
        type: 'scroll',
        title: '스크롤',
        description: '스크롤했을 때',
      },
    ],
    delay: {
      type: 'immediately',
      title: '즉시',
      description: '바로 보여줌',
    },
  },
  {
    id: '2',
    title: '설문조사 제목2',
    createAt: '2021.10.10',
    isDeploy: true,
    questions: [
      {
        id: 1,
        order: 0,
        type: 'welcome',
        title: '저희 서비스 이용이 처음이시군요!2',
        description: '설문조사에 참여해주실래요?',
        isActive: true,
      },
      {
        id: 2,
        order: 1,
        type: 'singleChoice',
        title: '회사에서의 역할은 무엇입니까?2',
        description: '솔직하게 응답해주세요',
        options: [
          {
            id: 1,
            value: 'CEO',
          },
          {
            id: 2,
            value: 'CTO',
          },
          {
            id: 3,
            value: 'CFO',
          },
          {
            id: 4,
            value: 'CPO',
          },
        ],
      },
      {
        id: 3,
        order: 2,
        type: 'link',
        title: '세상에 대표님이시군요!2',
        description: '아래 링크를 눌러 제발 저희와 인터뷰 일정을 잡아주세요',
      },
      {
        id: 4,
        order: 3,
        type: 'freeText',
        title: '와! 개발자시군요2!',
        description: '저희 제품에 대한 피드백을 주세요.',
      },
      {
        id: 5,
        order: 4,
        type: 'rating',
        title: 'CFO라구요2?',
        description: '저희 제품의 가격에 대해 어떻게 생각하세요?',
      },
      {
        id: 6,
        order: 5,
        type: 'multipleChoice',
        title: 'CPO라니2!',
        description: '저희 제품을 사용하시는 이유가 뭐죠?',
        options: ['기능', '디자인', '가격', '편의성'],
      },
      {
        id: 7,
        order: 6,
        type: 'thank',
        title: '수고하셨습니다2!',
        description: '설문조사에 참여해주셔서 감사합니다.',
        isActive: true,
      },
    ],
    triggers: [
      {
        id: 1,
        type: 'firstVisit',
        title: '첫 방문',
        description: '처음으로 방문했을 때',
      },
      {
        id: 2,
        type: 'click',
        title: '클릭',
        description: '클릭했을 때',
      },
      {
        id: 3,
        type: 'scroll',
        title: '스크롤',
        description: '스크롤했을 때',
      },
    ],
    delay: {
      type: 'immediately',
      title: '즉시',
      description: '바로 보여줌',
    },
  },
]

const Edit = () => {
  const { id } = useParams()

  const [survey, setSurvey] = useState({})

  useEffect(() => {
    if (id) {
      const selectedSurvey = surveys.find((survey) => survey.id === id)
      if (selectedSurvey) {
        setSurvey(selectedSurvey)
      }
    }
  }, [id])

  const navigate = useNavigate()

  // 뒤로가기
  const goBack = () => {
    navigate('/templates')
  }

  const [mode, setMode] = useState('surveys')

  const renderMain = () => {
    if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음

    if (mode === 'surveys') {
      return <Surveys survey={survey} setSurvey={setSurvey} />
    } else if (mode === 'triggers') {
      return <Triggers survey={survey} setSurvey={setSurvey} />
    } else if (mode === 'delays') {
      return <Delay survey={survey} setSurvey={setSurvey} />
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerPart}>
          <div className={styles.bigButton} onClick={goBack}>
            ◀︎ 뒤로가기
          </div>
          <div className={styles.title}>온보딩 세그먼트</div>
        </div>
        <div className={styles.headerPart}>
          <div className={styles.bigButton}>저장하기</div>
          <div className={styles.bigButtonBlack}>배포하기</div>
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

export default Edit
