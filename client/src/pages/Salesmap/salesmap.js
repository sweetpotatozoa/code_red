// salesmap.js
import { useEffect } from 'react'
import styles from './salesmap.module.css'

const Salesmap = () => {
  useEffect(() => {
    document.body.classList.add('salesmap-page')

    const script = document.createElement('script')
    script.src = 'https://salesmap.kr/web-form-loader-v3.js'
    script.id = 'loadFormScript'
    script.async = true
    script.onload = () => {
      window.SmFormSettings && window.SmFormSettings.loadForm()
    }
    document.body.appendChild(script)

    const handleFormSubmit = (event) => {
      if (
        event.data.type === 'salesmapWebFormCallback' &&
        event.data.eventName === 'onFormSubmitted'
      ) {
        window.gtag('event', 'form_submit_success', {
          event_category: 'salesmap_form',
        })
      }
    }

    window.addEventListener('message', handleFormSubmit)

    return () => {
      document.body.classList.remove('salesmap-page')
      const scriptElement = document.getElementById('loadFormScript')
      if (scriptElement) scriptElement.remove()
      window.removeEventListener('message', handleFormSubmit)
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
