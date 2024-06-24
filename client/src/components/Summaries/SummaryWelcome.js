import styles from './Summaries.module.css'

const SummaryWelcome = ({ data }) => {
  if (!data) return null
  const { views, responses } = data
  const ctr = views > 0 ? ((responses / views) * 100).toFixed(2) : '0.00'
  return (
    <div className={styles.summary}>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.informations}>
        <div className={styles.info}>환영인사</div>
        <div className={styles.info}>노출 {views}명</div>
        <div className={styles.info}>응답 {responses}명</div>
      </div>
      <div className={styles.title}>CTR {ctr}%</div>
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
