import styles from './Summaries.module.css'

const SummarySingleChoice = () => {
  const options = [
    {
      id: 1,
      eachResponses: 10,
    },
    {
      id: 2,
      eachResponses: 12,
    },
    {
      id: 3,
      eachResponses: 12,
    },
    {
      id: 4,
      eachResponses: 13,
    },
  ]

  //각 답변 분포
  const eachPercentage = (eachResponses, allResponses) => {
    return ((eachResponses / allResponses) * 100).toFixed(2)
  }

  const totalResponses = options.reduce(
    (total, option) => total + option.eachResponses,
    0,
  )

  return (
    <div className={styles.summary}>
      <div className={styles.title}>나는 별점이야!</div>
      <div className={styles.informations}>
        <div className={styles.info}>단수응답</div>
        <div className={styles.info}>응답 {totalResponses}명</div>
      </div>
      {options.map((option, index) => (
        <div key={option.id} className={styles.option}>
          <div className={styles.optionTitle}>
            <div className={styles.title}>
              {index + 1}개{' '}
              {eachPercentage(option.eachResponses, totalResponses)}%
            </div>
            <div className={styles.title}>응답수 {option.eachResponses}명</div>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressValue}
              style={{
                width: `${eachPercentage(
                  option.eachResponses,
                  totalResponses,
                )}%`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummarySingleChoice
