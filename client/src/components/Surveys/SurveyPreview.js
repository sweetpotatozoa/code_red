import { useState, useEffect } from 'react'
import styles from './SurveyPreview.module.css'

const SurveyPreview = ({
  selectedTemplate,
  currentStepId,
  setCurrentStepId,
  showContainer,
  setShowContainer,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [survey, setSurvey] = useState(selectedTemplate)

  useEffect(() => {
    setSurvey(selectedTemplate)
  }, [selectedTemplate])

  useEffect(() => {
    if (survey && currentStepId) {
      const currentStep = survey.steps.find((step) => step.id === currentStepId)
      if (
        currentStep &&
        currentStep.type === 'welcome' &&
        !currentStep.isActive
      ) {
        handleNextStep()
      }
    }
  }, [currentStepId, survey])

  const handleOptionChange = (option, isMultiple) => {
    setSelectedOptions((prevOptions) => {
      if (isMultiple) {
        if (
          prevOptions.some((selectedOption) => selectedOption.id === option.id)
        ) {
          return prevOptions.filter(
            (selectedOption) => selectedOption.id !== option.id,
          )
        } else {
          return [...prevOptions, option]
        }
      } else {
        return [option]
      }
    })
  }

  const handleNextStep = () => {
    if (survey) {
      const currentStepIndex = survey.steps.findIndex(
        (step) => step.id === currentStepId,
      )
      const currentStepData = survey.steps[currentStepIndex]

      if (!currentStepData) return

      let nextStepId = ''

      if (
        (currentStepData.type === 'singleChoice' ||
          currentStepData.type === 'rating') &&
        selectedOptions.length > 0
      ) {
        nextStepId = selectedOptions[0].nextStepId
      } else if (currentStepData.type === 'multipleChoice') {
        nextStepId = currentStepData.nextStepId
      } else if (currentStepData.type !== 'thank') {
        nextStepId = currentStepData.nextStepId
      }

      if (nextStepId === '') {
        const nextStepIndex = currentStepIndex + 1
        if (nextStepIndex < survey.steps.length) {
          nextStepId = survey.steps[nextStepIndex].id
        } else {
          setShowContainer(false)
          return
        }
      }

      if (nextStepId !== '') {
        setCurrentStepId(nextStepId)
        setSelectedOptions([])
      } else {
        setShowContainer(false)
      }
    }
  }

  const renderCloseButton = () => {
    return (
      <div
        className={styles.closeButton}
        onClick={() => setShowContainer(false)}
      >
        <img src='/images/close.svg' alt='close' />
      </div>
    )
  }

  const renderStepContent = (step) => {
    if ((step.type === 'welcome' || step.type === 'thank') && !step.isActive) {
      return null
    }
    switch (step.type) {
      case 'welcome':
      case 'thank':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
          </>
        )
      case 'freeText':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
            <div className={styles.textInputContainer}>
              <textarea className={styles.typingBox} />
            </div>
          </>
        )
      case 'multipleChoice':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
            <div className={styles.inputContainer}>
              {step.options.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.optionLabel} ${
                    selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )
                      ? styles.checked
                      : ''
                  }`}
                >
                  <input
                    type='checkbox'
                    name='option'
                    checked={selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )}
                    onChange={() => handleOptionChange(option, true)}
                  />
                  {option.value}
                </label>
              ))}
            </div>
          </>
        )
      case 'singleChoice':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
            <div className={styles.inputContainer}>
              {step.options.map((option) => (
                <label
                  key={option.id}
                  className={`${styles.optionLabel} ${
                    selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )
                      ? styles.checked
                      : ''
                  }`}
                >
                  <input
                    type='radio'
                    name='option'
                    checked={selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )}
                    onChange={() => handleOptionChange(option, false)}
                  />
                  {option.value}
                </label>
              ))}
            </div>
          </>
        )
      case 'rating':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
            <div className={styles.starInputContainer}>
              {[...step.options].reverse().map((option) => (
                <label
                  key={option.id}
                  className={`${styles.starOptionLabel} ${
                    selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )
                      ? styles.checked
                      : ''
                  }`}
                >
                  <input
                    type='radio'
                    name='rating'
                    value={option.value}
                    checked={selectedOptions.some(
                      (selectedOption) => selectedOption.id === option.id,
                    )}
                    onChange={() => handleOptionChange(option, false)}
                  />
                  <span className={styles.star}>★</span>
                </label>
              ))}
            </div>
          </>
        )
      case 'link':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
          </>
        )
      case 'info':
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
          </>
        )
      default:
        return (
          <>
            <div className={styles.title}>{step.title}</div>
            <div className={styles.description}>{step.description}</div>
          </>
        )
    }
  }

  const renderButton = (step) => {
    if (!step) return null

    if (step.type === 'welcome') {
      return (
        <div className={styles.button} onClick={handleNextStep}>
          참여하기
        </div>
      )
    } else if (step.type === 'thank') {
      return (
        <div className={styles.button} onClick={handleNextStep}>
          닫기
        </div>
      )
    } else if (step.type === 'link') {
      const handleLinkClick = () => {
        const url =
          step.url.startsWith('http://') || step.url.startsWith('https://')
            ? step.url
            : `https://${step.url}`

        window.open(url, '_blank', 'noopener,noreferrer')
        handleNextStep()
      }

      return (
        <div className={styles.button} onClick={handleLinkClick}>
          {step.buttonText || '링크로 이동'}
        </div>
      )
    } else {
      return (
        <div className={styles.button} onClick={handleNextStep}>
          다음
        </div>
      )
    }
  }

  const renderContainer = (step) => {
    if (!step) return null

    // welcome 또는 thank 스텝이 비활성 상태인 경우 null 반환
    if ((step.type === 'welcome' || step.type === 'thank') && !step.isActive) {
      return null
    }

    return (
      <div key={step.id} className={styles.container}>
        {renderCloseButton()}
        <div className={styles.step}>
          {renderStepContent(step)}
          <div className={styles.buttonContainer}>{renderButton(step)}</div>
          <div className={styles.footer}>
            <div className={styles.waterMark}>
              powered by <span className={styles.logo}>CatchTalk</span>
            </div>
            <div className={styles.backgroundBar}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${
                    ((survey.steps.findIndex((s) => s.id === step.id) + 1) /
                      survey.steps.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 유효한 스텝이 있는지 확인하는 함수
  const hasValidStep = (steps) => {
    return steps.some((step) => {
      if (step.type === 'welcome' || step.type === 'thank') {
        return step.isActive
      }
      return true
    })
  }

  if (
    !survey ||
    !survey.steps ||
    !currentStepId ||
    !showContainer ||
    !hasValidStep(survey.steps)
  ) {
    return null
  }

  let displayStep = survey.steps.find((step) => step.id === currentStepId)

  // welcome 스텝이 비활성이면 다음 유효한 스텝 찾기
  while (
    displayStep &&
    (displayStep.type === 'welcome' || displayStep.type === 'thank') &&
    !displayStep.isActive
  ) {
    displayStep = survey.steps.find(
      (step) => step.id === displayStep.nextStepId,
    )
  }

  // 유효한 스텝이 없으면 null 반환
  if (!displayStep) {
    return null
  }

  return (
    <div className={styles.previewContainer}>
      {renderContainer(displayStep)}
    </div>
  )
}

export default SurveyPreview
