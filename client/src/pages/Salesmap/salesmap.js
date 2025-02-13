import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const SalesMap = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  useEffect(() => {
    // referrer가 있고, 현재 URL에 referrel 파라미터가 없을 때만 추가
    const referrel = document.referrer
    if (referrel && !location.search.includes('referrel')) {
      // URLSearchParams를 사용해 현재 URL의 모든 파라미터를 유지
      const searchParams = new URLSearchParams(location.search)
      searchParams.append('referrel', referrel)

      // 파라미터들을 포함한 새로운 URL로 이동
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
