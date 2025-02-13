import { useEffect, useRef } from 'react'

const SalesMap = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    // 기존 스크립트가 있다면 제거
    const existingScript = document.getElementById('loadFormScript')
    if (existingScript) {
      existingScript.remove()
    }

    // 스크립트 엘리먼트 생성 및 추가
    const scriptElement = document.createElement('script')
    scriptElement.id = 'loadFormScript'
    scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js'
    scriptElement.onload = () => {
      if (window.SmFormSettings) {
        window.SmFormSettings.loadForm()
      }
    }

    // referrer 정보가 필요한 경우 URL에 추가
    const formUrl = document.referrer
      ? `https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb?referrer=${encodeURIComponent(
          document.referrer,
        )}`
      : 'https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb'

    // div 엘리먼트에 data-web-form 속성 설정
    if (containerRef.current) {
      containerRef.current.setAttribute('data-web-form', formUrl)
    }

    document.body.appendChild(scriptElement)

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [])

  return <div ref={containerRef} id='salesmap-web-form' />
}

export default SalesMap
