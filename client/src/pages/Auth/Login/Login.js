import styles from './Login.module.css'
import { useNavigate } from 'react-router-dom'
import backendApis from '../../../utils/backendApis'
import { useState } from 'react'

const Login = () => {
  const navigate = useNavigate()

  // 회원가입으로 이동
  const goToRegister = () => {
    navigate('/register')
  }

  // input 값 상태
  const [input, setInput] = useState({
    userName: '',
    password: '',
  })

  //로그인
  const loginHandler = async (e) => {
    e.preventDefault()
    try {
      const result = await backendApis.login('POST', { input })
      if (result.token) {
        alert('로그인 성공')
        localStorage.setItem('token', result.token)
        if (result.isOnboarding) navigate('/')
        else navigate('/onboarding')
      } else {
        alert(result.message || '로그인에 실패했습니다')
      }
    } catch (error) {
      alert('서버에 문제가 생겼습니다. 나중에 다시 시도해주세요.')
    }
  }

  // input 값 변경
  const changeHandler = (e) => {
    const { name, value } = e.target
    setInput({
      ...input,
      [name]: value,
    })
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>코드레드</div>
      <div className={styles.form}>
        <form onSubmit={loginHandler}>
          <input
            type='text'
            placeholder='아이디'
            onChange={changeHandler}
            name='userName'
            value={input.userName}
            required
          />
          <input
            type='password'
            placeholder='비밀번호'
            onChange={changeHandler}
            name='password'
            value={input.password}
            required
          />
          <button type='submit'>로그인</button>
        </form>
      </div>
      <div className={styles.footer} onClick={goToRegister}>
        회원가입
      </div>
    </div>
  )
}

export default Login
