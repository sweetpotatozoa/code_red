import styles from './Onboarding.module.css'
import { useState } from 'react'
import Role from '../../components/Onboardings/Role'
import Purpose from '../../components/Onboardings/Purpose'
import Connecting from '../../components/Onboardings/Connecting'
import Complete from '../../components/Onboardings/Complete'

const Onboarding = () => {
  //현재 단계
  const [currentStep, setCurrentStep] = useState(0)

  //온보딩 응답 정보
  const [onboardingInfo, setOnboardingInfo] = useState({
    role: '',
    purpose: '',
    isConnect: false,
    isOnboarding: false,
  })

  console.log(onboardingInfo)
  console.log(currentStep)

  //랜더링
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Role
            setCurrentStep={setCurrentStep}
            setOnboardingInfo={setOnboardingInfo}
          />
        )
      case 1:
        return (
          <Purpose
            setCurrentStep={setCurrentStep}
            setOnboardingInfo={setOnboardingInfo}
          />
        )
      case 2:
        return (
          <Connecting
            setCurrentStep={setCurrentStep}
            setOnboardingInfo={setOnboardingInfo}
          />
        )
      case 3:
        return <Complete onboardingInfo={onboardingInfo} />
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <img src='/images/logo.png' />
        </div>
        <div className={styles.status}>
          <div className={styles.progressBar}>
            <div
              className={styles.percentBar}
              style={{ width: `${((currentStep + 1) / 4) * 100}%` }}
            ></div>
          </div>
          <div className={styles.percent}>
            {((currentStep + 1) / 4) * 100}% 완료됨
          </div>
        </div>
      </div>
      {renderStep()}
    </div>
  )
}

export default Onboarding
