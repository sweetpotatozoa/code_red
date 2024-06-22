import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login/Login'
import Register from './pages/Auth/Register/Register'
import Onboarding from './pages/Onboarding/Onboarding'
import Responses from './pages/Responses/Responses'
import Summary from './pages/Summary/Summary'
import Templates from './pages/Templates/Templates'
import Edit from './pages/Edit/Edit'
import TestSummary from './pages/Summary/TestSummary'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/onboarding' element={<Onboarding />} />
      <Route path='/responses/:id' element={<Responses />} />
      <Route path='/summary/:id' element={<Summary />} />
      <Route path='/templates' element={<Templates />} />
      <Route path='/edit/:id' element={<Edit />} />
      <Route path='/test-summary/:surveyId' element={<TestSummary />} />
    </Routes>
  )
}

export default App
