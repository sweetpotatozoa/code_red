import styles from './Summaries.module.css'

const SummaryLink = () => {
  const responses = 30
  return (
    <div className={styles.summary}>
      <div className={styles.title}>쿠폰 받아가세요!</div>
      <div className={styles.informations}>
        <div className={styles.info}>링크</div>
      </div>
      <div className={styles.title}>클릭 {responses}명</div>
    </div>
  )
}

export default SummaryLink
