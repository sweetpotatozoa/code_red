import { useEffect, useRef } from 'react'

const SalesMap = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const existingScript = document.getElementById('loadFormScript')
    if (existingScript) {
      existingScript.remove()
    }

    const scriptElement = document.createElement('script')
    scriptElement.id = 'loadFormScript'
    scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js'
    scriptElement.onload = () => {
      if (window.SmFormSettings) {
        window.SmFormSettings.loadForm()
      }
    }

    // referrel 파라미터로 수정
    const formUrl = document.referrer
      ? `https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb?referrel=${encodeURIComponent(
          document.referrer,
        )}`
      : 'https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb'

    if (containerRef.current) {
      containerRef.current.setAttribute('data-web-form', formUrl)
    }

    document.body.appendChild(scriptElement)

    return () => {
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [])

  return <div ref={containerRef} id='salesmap-web-form' />
}

export default SalesMap
