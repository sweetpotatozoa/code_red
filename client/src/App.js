import './App.css'
import { Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute/PrivateRoute'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login/Login'
import Register from './pages/Auth/Register/Register'
import Onboarding from './pages/Onboarding/Onboarding'
import Responses from './pages/Responses/Responses'
import Summary from './pages/Summary/Summary'
import Templates from './pages/Templates/Templates'
import Edit from './pages/Edit/Edit'
import { useMediaQuery } from 'react-responsive'

function App() {
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  useEffect(() => {
    if (isMobile) {
      document.body.style.minHeight = 'auto'
      document.body.style.minWidth = 'auto'
    } else {
      document.body.style.minHeight = '732px'
      document.body.style.minWidth = '1420px'
    }
  }, [isMobile])

  useEffect(() => {
    if (isMobile) {
      alert('PC로 접속해주세요')
    }
  }, [isMobile])

  return isMobile ? (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <p style={{ fontSize: '32px', color: 'black', fontWeight: 'bold' }}>
        아직 모바일을 지원하지 않습니다.
        <br />
        PC로 접속해주세요 :)
      </p>
    </div>
  ) : (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
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
    </Routes>
  )
}

export default App
