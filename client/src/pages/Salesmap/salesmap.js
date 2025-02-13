import { useEffect, useRef } from 'react'

const SalesMap = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    // 기존 스크립트가 있다면 제거
    const existingScript = document.getElementById('loadFormScript')
    if (existingScript) {
      existingScript.remove()
    }

    // 현재 페이지의 실제 referrel 가져오기
    const referrel = document.referrer || ''

    // 웹폼 URL에 referrel 추가
    const formUrl = `https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb?referrel=${encodeURIComponent(
      referrel,
    )}`

    // div에 URL 설정
    if (containerRef.current) {
      containerRef.current.setAttribute('data-web-form', formUrl)
    }

    // 스크립트 로드
    const scriptElement = document.createElement('script')
    scriptElement.id = 'loadFormScript'
    scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js'
    scriptElement.onload = () => {
      if (window.SmFormSettings) {
        window.SmFormSettings.loadForm()
      }
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
