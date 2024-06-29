import { useState, useEffect } from 'react'
import styles from './TemplatePreview.module.css'

const TemplatePreview = ({
  selectedTemplate,
  currentStepId,
  setCurrentStepId,
  showContainer,
  setShowContainer,
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState([])

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
        // welcome 타입이고 isActive가 false일 때 다음 스텝으로 자동 이동
        handleNextStep()
      }
    }
  }, [currentStepId, selectedTemplate])

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
    if (selectedTemplate && !isTransitioning) {
      const currentStepData = selectedTemplate.steps.find(
        (step) => step.id === currentStepId,
      )

      if (!currentStepData) return

      let nextStepId

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

      if (nextStepId) {
        setIsTransitioning(true)
        setTimeout(() => {
          setCurrentStepId(nextStepId)
          setSelectedOptions([])
          setIsTransitioning(false)
        }, 400)
      } else {
        setShowContainer(false)
      }
    }
  }

  // 상단 닫기 버튼 랜더링
  const renderCloseButton = () => {
    return (
      <div
        className={styles.closeButton}
        onClick={() => setShowContainer(false)}
      >
        <img src='/images/close.png' alt='close' />
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
                  <span className={styles.star}>&#9733;</span>
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
      return (
        <a href={step.url} target='_blank'>
          <div className={styles.button} onClick={handleNextStep}>
            링크로 이동
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
          step.id === currentStepId
            ? isTransitioning
              ? styles.exit
              : styles.current
            : styles.next
        }`}
      >
        {renderCloseButton()}
        <div className={styles.step}>
          {renderStepContent(step)}
          <div className={styles.buttonContainer}>{renderButton(step)}</div>
          <div className={styles.footer}>
            <div className={styles.waterMark}>
              powered by <span className={styles.logo}>CodeRed</span>
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

  // welcome 타입이고 isActive가 false인 경우 다음 스텝을 찾음
  let displayStep = currentStep
  if (currentStep?.type === 'welcome' && !currentStep?.isActive) {
    displayStep = selectedTemplate.steps.find(
      (step) => step.id === currentStep.nextStepId,
    )
  }

  const nextStepId = displayStep?.nextStepId
  const nextStep = nextStepId
    ? selectedTemplate.steps.find((step) => step.id === nextStepId)
    : null

  return (
    <div className={styles.previewContainer}>
      {displayStep && renderContainer(displayStep)}
      {nextStep && renderContainer(nextStep)}
    </div>
  )
}

export default TemplatePreview
