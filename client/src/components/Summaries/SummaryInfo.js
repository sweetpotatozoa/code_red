import styles from './Summaries.module.css'

const SummaryInfo = ({ data }) => {
  if (!data) return null
  return (
    <div className={styles.summary}>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.informations}>
        <div className={styles.info}>정보 제공</div>
      </div>
      <div className={styles.title}>클릭 {data.clicks}명</div>
    </div>
  )
}

export default SummaryInfo
