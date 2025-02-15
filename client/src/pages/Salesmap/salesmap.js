import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SalesMap = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  useEffect(() => {
    const referrel = document.referrer
    if (referrel && !location.search.includes('referrel')) {
      // URL 파라미터 파싱을 위한 URLSearchParams 사용
      const searchParams = new URLSearchParams(window.location.search)

      // 이전 페이지의 기본 URL만 추출 (파라미터 제외)
      const prevUrl = new URL(referrel)
      const cleanReferrel = prevUrl.origin + prevUrl.pathname

      // UTM 파라미터가 있다면 복사
      const prevParams = new URLSearchParams(prevUrl.search)
      for (const [key, value] of prevParams.entries()) {
        if (key.startsWith('utm_')) {
          searchParams.set(key, value)
        }
      }

      // referrel 추가 (파라미터가 없는 깨끗한 URL)
      searchParams.set('referrel', cleanReferrel)

      // 새로운 URL로 이동
      navigate(`${location.pathname}?${searchParams.toString()}`, {
        replace: true,
      })
    }

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
