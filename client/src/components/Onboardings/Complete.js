import styles from './Onboarding.module.css'
import { useNavigate } from 'react-router-dom'
import backendApis from '../../utils/backendApis'

const Complete = ({ onboardingInfo }) => {
  const navigate = useNavigate()

  //템플릿 페이지로 이동
  const goToTemplates = () => {
    navigate('/templates')
  }

  //온보딩 정보 저장
  const saveOnboardingInfo = async () => {
    try {
      const result = await backendApis.saveOnboardingInfo(
        'POST',
        onboardingInfo,
      )
      if (result) {
        goToTemplates()
      }
    } catch (error) {
      alert(error.message || '온보딩 정보 저장에 실패했습니다.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>연결이 완료되었어요!</div>
      <div className={styles.description}>
        이제 원하는 설문조사만 만들면 끝이에요
      </div>
      <div className={styles.contents2}>
        <div className={styles.complete}>
          <div>
            <img src='/images/completeOnboarding.svg'></img>
          </div>
          연결성공!
        </div>
        <div className={styles.buttons} style={{ justifyContent: 'flex-end' }}>
          <button style={{ marginRight: 0 }} onClick={saveOnboardingInfo}>
            다음
          </button>
        </div>
      </div>
    </div>
  )
}

export default Complete
