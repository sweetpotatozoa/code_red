import styles from './Summaries.module.css'

const SummaryWelcome = () => {
  const views = 100
  const responses = 30
  const ctr = ((responses / views) * 100).toFixed(2)
  return (
    <div className={styles.summary}>
      <div className={styles.title}>안녕하세요</div>
      <div className={styles.informations}>
        <div className={styles.info}>환영인사</div>
        <div className={styles.info}>노출 {views}명</div>
        <div className={styles.info}>응답 {responses}명</div>
      </div>
      <div className={styles.title}>CTR %</div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressValue}
          style={{ width: `${ctr}%` }}
        ></div>
      </div>
    </div>
  )
}

export default SummaryWelcome
