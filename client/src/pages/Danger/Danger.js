import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SalesMapForm = () => {
  const formContainerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Create container div with the required ID and data attribute
    const containerDiv = document.createElement('div')
    containerDiv.id = 'salesmap-web-form'
    containerDiv.setAttribute(
      'data-web-form',
      'https://salesmap.kr/web-form/518887ea-9687-476e-a173-3def27095baa',
    )

    // Append container to our ref
    if (formContainerRef.current) {
      formContainerRef.current.appendChild(containerDiv)
    }

    // Create script element
    const scriptElement = document.createElement('script')
    scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js'
    scriptElement.id = 'loadFormScript'

    // Define onload callback
    scriptElement.onload = function () {
      if (
        window.SmFormSettings &&
        typeof window.SmFormSettings.loadForm === 'function'
      ) {
        window.SmFormSettings.loadForm()
      }
    }

    // Append script to container
    if (formContainerRef.current) {
      formContainerRef.current.appendChild(scriptElement)
    }

    // Cleanup function to remove script and container when component unmounts
    return () => {
      const loadFormScript = document.getElementById('loadFormScript')
      if (loadFormScript) {
        loadFormScript.remove()
      }

      if (formContainerRef.current) {
        formContainerRef.current.innerHTML = ''
      }
    }
  }, [])

  return (
    <div className='salesmap-form-page'>
      <div ref={formContainerRef} className='form-container'></div>
    </div>
  )
}

export default SalesMapForm
