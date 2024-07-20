import { useEffect } from 'react'

function useBlocker(blocker, when = true) {
  useEffect(() => {
    if (!when) return

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = blocker(event)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.history.pushState(null, null, window.location.pathname)
    window.addEventListener('popstate', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handleBeforeUnload)
    }
  }, [blocker, when])
}

export default useBlocker
