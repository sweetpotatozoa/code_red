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
            <div className={styles.inputContainer}>
              <textarea placeholder='Enter text' className={styles.typingBox} />
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

  if (!survey || !survey.steps || !currentStepId || !showContainer) {
    return null
  }

  const currentStep = survey.steps.find((step) => step.id === currentStepId)

  let displayStep = currentStep
  if (currentStep?.type === 'welcome' && !currentStep?.isActive) {
    displayStep = survey.steps.find(
      (step) => step.id === currentStep.nextStepId,
    )
  }

  return (
    <div className={styles.previewContainer}>
      {displayStep && renderContainer(displayStep)}
    </div>
  )
}

export default SurveyPreview
