import styles from './Onboarding.module.css'
import { useState } from 'react'

const Role = ({ setCurrentStep, setOnboardingInfo }) => {
  const options = [
    '대표 및 공동창업자',
    'PM, PO',
    '개발자',
    '디자이너',
    '마케터',
    '직접입력',
  ]

  // 선택된 역할
  const [selectedOption, setSelectedOption] = useState('')
  const [customInput, setCustomInput] = useState('')

  // 선택된 역할 변경
  const changeHandler = (e) => {
    setSelectedOption(e.target.value)
    if (e.target.value !== '직접입력') {
      setCustomInput('')
    }
  }

  // 직접 입력 필드 변경
  const customInputChangeHandler = (e) => {
    setCustomInput(e.target.value)
  }

  // 다음 버튼 클릭
  const nextClickHandler = (e) => {
    e.preventDefault()
    const finalValue =
      selectedOption === '직접입력' ? customInput : selectedOption
    if (finalValue) {
      setCurrentStep((prevStep) => prevStep + 1)
      setOnboardingInfo((prevInfo) => ({ ...prevInfo, role: finalValue }))
    } else {
      alert('역할을 선택해주세요.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>당신의 역할은 무엇인가요?</div>
      <div className={styles.description}>
        저희가 맞춤형 서비스를 제공할 수 있도록 도와주세요.
      </div>
      <div className={styles.contents}>
        <form onSubmit={nextClickHandler} className={styles.form}>
          {options.map((option, index) => (
            <label key={index} className={styles.label}>
              <input
                type='radio'
                name='role'
                value={option}
                checked={selectedOption === option}
                onChange={changeHandler}
              />
              {option === '직접입력' && selectedOption === '직접입력' ? (
                <input
                  className={styles.customInput}
                  type='text'
                  value={customInput}
                  onChange={customInputChangeHandler}
                  placeholder='여기에 직접 입력해주세요.'
                  style={{ width: 'calc(100% - 34px)' }} // 라디오 버튼 너비와 마진 고려
                />
              ) : (
                option
              )}
            </label>
          ))}
          <button type='submit' className={styles.button}>
            다음
          </button>
        </form>
      </div>
    </div>
  )
}

export default Role
