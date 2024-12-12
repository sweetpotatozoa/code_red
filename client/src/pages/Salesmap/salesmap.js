import { useEffect } from 'react'
import styles from './salesmap.module.css'

const Salesmap = () => {
 useEffect(() => {
   // 페이지 진입시 클래스 추가
   document.body.classList.add('salesmap-page')

   // 스크립트를 동적으로 추가
   const script = document.createElement('script')
   script.src = 'https://salesmap.kr/web-form-loader-v3.js'
   script.id = 'loadFormScript'
   script.async = true
   script.onload = () => {
     window.SmFormSettings && window.SmFormSettings.loadForm()
   }
   document.body.appendChild(script)

   // 폼 제출 추적
   const handleFormSubmit = (event) => {
     if (
       event.data.type === 'salesmapWebFormCallback' && 
       event.data.eventName === 'onFormSubmitted'
     ) {
       window.gtag('event', 'form_submit_success', {
         'event_category': 'salesmap_form'
       })
     }
   }

   window.addEventListener('message', handleFormSubmit)

   return () => {
     // 클린업: 페이지 나갈때 클래스와 스크립트 제거
     document.body.classList.remove('salesmap-page')
     const scriptElement = document.getElementById('loadFormScript')
     if (scriptElement) scriptElement.remove()
     // 이벤트 리스너 제거
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