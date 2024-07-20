import styles from './Summaries.module.css'

const SummaryLink = ({ data }) => {
  if (!data) return null
  return (
    <div className={styles.summary}>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.informations}>
        <div className={styles.info}>링크</div>
      </div>
      <div className={styles.title}>클릭 {data.clicks}명</div>
    </div>
  )
}

export default SummaryLink
