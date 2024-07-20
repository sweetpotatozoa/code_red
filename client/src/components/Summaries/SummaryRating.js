import styles from './Summaries.module.css'

const SummaryRating = ({ data }) => {
  if (!data) return null
  const { options, totalResponses, averageScore } = data

  const eachPercentage = (eachResponses, allResponses) => {
    return allResponses > 0
      ? ((eachResponses / allResponses) * 100).toFixed(2)
      : '0.00'
  }

  return (
    <div className={styles.summary}>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.informations}>
        <div className={styles.info}>별점</div>
        <div className={styles.info}>평균 {averageScore}점</div>
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

export default SummaryRating
