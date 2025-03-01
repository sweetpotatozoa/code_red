import React, { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import backendApis from '../../utils/backendApis'

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAuthenticated(false)
        setIsLoading(false)
        return
      }

      try {
        // 토큰을 사용하여 인증 상태 확인
        const authResult = await backendApis.checkAuth()
        setIsAuthenticated(authResult.isAuthenticated)
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to='/login' replace />
}

export default PrivateRoute
