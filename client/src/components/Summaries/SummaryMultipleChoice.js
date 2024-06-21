import styles from './Summaries.module.css'

const SummaryMultipleChoice = () => {
  const allResponses = 30
  const eachResponses = 20
  const options = [
    {
      id: 1,
      value: '옵션1',
    },
    {
      id: 2,
      value: '옵션2',
    },
    {
      id: 3,
      value: '옵션3',
    },
    {
      id: 4,
      value: '옵션4',
    },
  ]
  const ctr = ((eachResponses / allResponses) * 100).toFixed(2)

  return (
    <div className={styles.summary}>
      <div className={styles.title}>마음껏 골라!</div>
      <div className={styles.informations}>
        <div className={styles.info}>복수응답</div>
        <div className={styles.info}>응답 {allResponses}명</div>
      </div>
      {options.map((option) => (
        <div key={option.id} className={styles.option}>
          <div className={styles.optionTitle}>
            <div className={styles.title}>
              {option.value} {ctr}%
            </div>
            <div className={styles.title}>응답수 {eachResponses}명</div>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressValue}
              style={{ width: `${ctr}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SummaryMultipleChoice
