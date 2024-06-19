import styles from './Summaries.module.css'

const SummaryFreeText = () => {
  const responses = 30
  return (
    <div className={styles.summary}>
      <div className={styles.title}>안녕하세요</div>
      <div className={styles.informations}>
        <div className={styles.info}>환영인사</div>
        <div className={styles.info}>응답 {responses}명</div>
      </div>
      <div className={styles.title}>응답내용</div>
      <div className={styles.contents}>
        <div className={styles.content}>응답내용</div>
        <div className={styles.content}>응답내용</div>
      </div>
    </div>
  )
}

export default SummaryFreeText
