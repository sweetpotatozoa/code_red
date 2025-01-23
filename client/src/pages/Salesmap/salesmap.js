import { useEffect } from 'react'
import styles from './salesmap.module.css'

const Salesmap = () => {
  useEffect(() => {
    document.body.classList.add('salesmap-page')

    const script = document.createElement('script')
    script.src = 'https://salesmap.kr/meeting-form-loader.js'
    script.id = 'loadFormScript'
    script.async = true
    script.onload = () => {
      window.SmFormSettings && window.SmFormSettings.loadForm()
    }

    const formDiv = document.getElementById('salesmap-meeting-form')
    if (formDiv) {
      formDiv.parentNode.insertBefore(script, formDiv)
    }

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
        id='salesmap-meeting-form'
        data-meeting-form='https://dev.salesmap.kr/meeting/29e0a3fd-18a6-44fc-8ba0-2b9ed4664908/01949103-8b2b-7dd3-9485-33ea331d8aec'
      />
    </div>
  )
}

export default Salesmap
