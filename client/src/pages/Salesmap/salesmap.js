import { useEffect } from 'react'
import styles from './salesmap.module.css'

const Salesmap = () => {
  useEffect(() => {
    // 스크립트를 동적으로 추가
    const script = document.createElement('script')
    script.src = 'https://salesmap.kr/web-form-loader-v3.js'
    script.id = 'loadFormScript'
    script.async = true
    script.onload = () => {
      window.SmFormSettings && window.SmFormSettings.loadForm()
    }
    document.body.appendChild(script)

    return () => {
      // 클린업
      const scriptElement = document.getElementById('loadFormScript')
      if (scriptElement) scriptElement.remove()
    }
  }, [])

  return (
    <div className={styles.container}>
      <div
        id='salesmap-web-form'
        data-web-form='https://salesmap.kr/web-form/ebf2f1b5-b435-4ba0-9821-4b8c2ef31cb8'
      />
    </div>
  )
}

export default Salesmap
