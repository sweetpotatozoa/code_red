import styles from './Summaries.module.css'

const SummaryFreeText = ({ data }) => {
  const { responses, contents } = data
  return (
    <div className={styles.summary}>
      <div className={styles.title}>{data.title}</div>
      <div className={styles.informations}>
        <div className={styles.info}>자유 텍스트</div>
        <div className={styles.info}>응답 {responses}명</div>
      </div>
      <div className={styles.title}>응답내용</div>
      <div className={styles.contents}>
        {contents.map((content, index) => (
          <div key={index} className={styles.content}>
            {content}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SummaryFreeText
