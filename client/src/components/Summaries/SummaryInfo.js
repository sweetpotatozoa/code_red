import styles from './Summaries.module.css'

const SummaryInfo = () => {
  const responses = 30
  return (
    <div className={styles.summary}>
      <div className={styles.title}>안녕하세요</div>
      <div className={styles.informations}>
        <div className={styles.info}>환영인사</div>
      </div>
      <div className={styles.title}>클릭 {responses}명</div>
    </div>
  )
}

export default SummaryInfo
