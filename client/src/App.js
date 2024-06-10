import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Onboarding from './pages/Onboarding/Onboarding'
import Responses from './pages/Responses/Responses'
import Summary from './pages/Summary/Summary'
import Templates from './pages/Templates/Templates'

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/onboarding' element={<Onboarding />} />
        <Route path='/responses' element={<Responses />} />
        <Route path='/summary' element={<Summary />} />
        <Route path='/templates' element={<Templates />} />
      </Routes>
    </>
  )
}

export default App
