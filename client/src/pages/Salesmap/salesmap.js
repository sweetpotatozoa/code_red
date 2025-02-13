// SalesMap.js - 웹폼과 페이지 로직을 하나의 파일로 합친 버전
import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SalesMap = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  useEffect(() => {
    // referrel 파라미터 처리
    if (!location.search.includes('referrel')) {
      const referrel = document.referrer || ''
      const currentSearch = location.search
      const newSearch = currentSearch
        ? `${currentSearch}&referrel=${encodeURIComponent(referrel)}`
        : `?referrel=${encodeURIComponent(referrel)}`

      navigate(`${location.pathname}${newSearch}`, { replace: true })
    }

    // 웹폼 스크립트 처리
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

    if (containerRef.current) {
      containerRef.current.setAttribute(
        'data-web-form',
        'https://salesmap.kr/web-form/a64935d8-524d-4f2b-b2ff-57f83b5a14eb',
      )
    }

    document.body.appendChild(scriptElement)

    // 클린업
    return () => {
      if (scriptElement) {
        scriptElement.remove()
      }
    }
  }, [location, navigate])

  return (
    <div className='container'>
      <div ref={containerRef} id='salesmap-web-form' />
    </div>
  )
}

export default SalesMap
