import { useCallback } from 'react'
import useBlocker from './useBlocker'

function usePrompt(message, when = true) {
  const blocker = useCallback(
    (event) => {
      const shouldBlock = window.confirm(message)
      if (!shouldBlock) {
        window.history.pushState(null, null, window.location.pathname)
      }
      return shouldBlock
    },
    [message],
  )

  useBlocker(blocker, when)
}

export default usePrompt
