import { useState, useEffect } from 'react'
import styles from './TemplatePreview.module.css'

const TemplatePreview = ({
  selectedTemplate,
  currentStepId,
  setCurrentStepId,
  showContainer,
  setShowContainer,
}) => {
  const [selectedOptions, setSelectedOptions] = useState([])

  // 템플릿 선택에 따른 초기 세팅
  useEffect(() => {
    if (selectedTemplate && currentStepId) {
      const currentStep = selectedTemplate.steps.find(
        (step) => step.id === currentStepId,
      )
      if (
        currentStep &&
        currentStep.type === 'welcome' &&
        !currentStep.isActive
      ) {
        const currentIndex = selectedTemplate.steps.findIndex(
          (step) => step.id === currentStepId,
        )
        const nextStepId = selectedTemplate.steps[currentIndex + 1]?.id
        if (nextStepId) {
          setCurrentStepId(nextStepId)
        } else {
          setShowContainer(false)
        }
      }
    }
  }, [currentStepId, selectedTemplate, setCurrentStepId, setShowContainer])

  useEffect(() => {
    // Show the container when a new template is selected
    if (selectedTemplate) {
      setShowContainer(true)
    }
  }, [selectedTemplate, setShowContainer])

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
        // SingleChoice, rating의 경우 항상 하나의 옵션만 선택
        return [option]
      }
    })
  }

  const handleNextStep = () => {
    if (selectedTemplate) {
      const currentStepData = selectedTemplate.steps.find(
        (step) => step.id === currentStepId,
      )

      if (!currentStepData) {
        return
      }

      if (
        (currentStepData.type === 'singleChoice' ||
          currentStepData.type === 'rating' ||
          currentStepData.type === 'multipleChoice') &&
        selectedOptions.length === 0
      ) {
        // 옵션이 선택되지 않은 경우 아무 동작도 하지 않음
        return
      }

      let nextStepId

      if (
        currentStepData.type === 'welcome' ||
        currentStepData.type === 'thank'
      ) {
        // welcome 스텝의 경우, 다음 스텝으로 이동
        const currentIndex = selectedTemplate.steps.findIndex(
          (step) => step.id === currentStepId,
        )
        nextStepId = selectedTemplate.steps[currentIndex + 1]?.id || ''
      } else if (
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

      if (nextStepId) {
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
              {step.options.map((option) => (
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
        <div className={styles.button} onClick={() => setShowContainer(false)}>
          닫기
        </div>
      )
    } else if (step.type === 'link') {
      return (
        <a href={step.url} target='_blank' rel='noreferrer'>
          <div className={styles.button} onClick={handleNextStep}>
            {step.buttonText}
          </div>
        </a>
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
      <div
        key={step.id}
        className={`${styles.container} ${
          step.id === currentStepId ? styles.current : styles.next
        }`}
      >
        {renderCloseButton()}
        <div className={styles.step}>
          {renderStepContent(step)}
          <div className={styles.buttonContainer}>{renderButton(step)}</div>
          <div className={styles.footer}>
            <div className={styles.waterMark}>
              Powered by <span className={styles.logo}>CatchTalk</span>
            </div>
            <div className={styles.backgroundBar}>
              <div
                className={styles.progressBar}
                style={{
                  width: `${
                    ((selectedTemplate.steps.findIndex(
                      (s) => s.id === step.id,
                    ) +
                      1) /
                      selectedTemplate.steps.length) *
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

  if (
    !selectedTemplate ||
    !selectedTemplate.steps ||
    !currentStepId ||
    !showContainer
  ) {
    return null
  }

  const currentStep = selectedTemplate.steps.find(
    (step) => step.id === currentStepId,
  )

  let displayStep = currentStep
  if (currentStep?.type === 'welcome' && !currentStep?.isActive) {
    const currentIndex = selectedTemplate.steps.findIndex(
      (step) => step.id === currentStepId,
    )
    displayStep = selectedTemplate.steps[currentIndex + 1]
    setCurrentStepId(displayStep.id)
  }

  return (
    <div className={styles.previewContainer}>
      {displayStep && renderContainer(displayStep)}
    </div>
  )
}

export default TemplatePreview
