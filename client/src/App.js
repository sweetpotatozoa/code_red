// App.js
import './App.css'
import { Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login/Login'
import Register from './pages/Auth/Register/Register'
import Onboarding from './pages/Onboarding/Onboarding'
import Responses from './pages/Responses/Responses'
import Summary from './pages/Summary/Summary'
import Templates from './pages/Templates/Templates'
import Edit from './pages/Edit/Edit'
import Salesmap from './pages/Salesmap/salesmap'
import Mermaid from './pages/MermaidG/mermaid'
import { DiagramNotFoundError } from 'mermaid/dist/diagram-api/diagramAPI.js'

function App() {
  const location = useLocation()

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-WGX1YS6SP3'
    script.async = true
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() {
      window.dataLayer.push(arguments)
    }
    gtag('js', new Date())
    gtag('config', 'G-WGX1YS6SP3')
  }, [])

  useEffect(() => {
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
      })
    }
  }, [location])

  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/mermaid' element={<Mermaid />} />
      <Route path='/danger' element={<Danger />} />
      <Route
        path='/'
        element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path='/onboarding'
        element={
          <PrivateRoute>
            <Onboarding />
          </PrivateRoute>
        }
      />
      <Route
        path='/responses/:id'
        element={
          <PrivateRoute>
            <Responses />
          </PrivateRoute>
        }
      />
      <Route
        path='/summary/:id'
        element={
          <PrivateRoute>
            <Summary />
          </PrivateRoute>
        }
      />
      <Route
        path='/templates'
        element={
          <PrivateRoute>
            <Templates />
          </PrivateRoute>
        }
      />
      <Route
        path='/edit/:id'
        element={
          <PrivateRoute>
            <Edit />
          </PrivateRoute>
        }
      />
      <Route path='/salesmap' element={<Salesmap />} />
    </Routes>
  )
}

export default App
