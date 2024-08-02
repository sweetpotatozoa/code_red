import styles from './Create.module.css'
import { useNavigate } from 'react-router-dom'

const Create = () => {
  const navigate = useNavigate()

  // 뒤로가기 버튼
  const goBack = () => {
    navigate('/')
  }

  // ai와 대화하기
  const goAi = () => {
    navigate('/createWithAi')
  }

  // 템프릿 보기
  const goTemplates = () => {
    navigate('/templates')
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
          <div className={styles.choiceButtons}>
            <div className={styles.choiceButton}>
              <img src='/images/chatbot.svg' onClick={goAi}></img>
            </div>
            <div className={styles.choiceButton}>
              <img src='/images/template.svg' onClick={goTemplates}></img>
            </div>
          </div>
        </div>
        <div className={styles.display}>
          <div className={styles.website}>
            <div className={styles.top}>
              <img
                src='/images/mac.svg'
                className={styles.macButton}
                alt='Mac button'
              />
              <div className={styles.yourWeb}>나의 서비스</div>
            </div>
          </div>
          <div className={styles.bottom}></div>
        </div>
      </div>
    </div>
  )
}

export default Create
