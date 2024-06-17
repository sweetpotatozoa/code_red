import styles from './Delay.module.css'

const Delays = ({ survey, setSurvey }) => {
  if (!survey) return null // survey가 없으면 아무것도 렌더링하지 않음
  return (
    <div className={styles.delays}>
      <h1>delays</h1>
    </div>
  )
}

export default Delays
