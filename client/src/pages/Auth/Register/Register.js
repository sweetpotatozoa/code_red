import styles from './Register.module.css'
import { useNavigate } from 'react-router-dom'
import backendApis from '../../../utils/backendApis'
import { useState } from 'react'

const Register = () => {
  const navigate = useNavigate()

  // input 값 상태
  const [input, setInput] = useState({
    userName: '',
    password: '',
    realName: '',
    phoneNumber: '',
    company: '',
  })

  const changeHandler = (e) => {
    const { name, value } = e.target
    setInput({
      ...input,
      [name]: value,
    })
  }

  // 회원가입 성공시 로그인 페이지로 이동
  const goToLogin = () => {
    navigate('/login')
  }

  // 회원가입
  const registerHandler = async (e) => {
    e.preventDefault()
    try {
      const result = await backendApis.register('POST', { input })
      if (result.message === '회원가입 성공') {
        alert('회원가입이 완료되었습니다. 로그인 해주세요.')
        goToLogin()
      } else {
        alert(result.message || '회원가입에 실패했습니다')
      }
    } catch (error) {
      alert('서버에 문제가 생겼습니다. 나중에 다시 시도해주세요.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.logo}>코드레드</div>
      <div className={styles.form}>
        <form onSubmit={registerHandler}>
          <input
            type='text'
            name='userName'
            placeholder='아이디 (영문, 숫자조합 8자리 이상)'
            onChange={changeHandler}
            value={input.userName}
            required
          />
          <input
            type='password'
            name='password'
            placeholder='비밀번호 (영문, 숫자조합 8자리 이상)'
            onChange={changeHandler}
            value={input.password}
            required
          />
          <input
            type='text'
            name='realName'
            placeholder='이름'
            value={input.realName}
            required
            onChange={changeHandler}
          />
          <input
            type='text'
            name='phoneNumber'
            placeholder='전화번호'
            onChange={changeHandler}
            value={input.phoneNumber}
            required
          />
          <input
            type='text'
            name='company'
            placeholder='회사명'
            onChange={changeHandler}
            value={input.company}
            required
          />
          <button type='submit'>회원가입</button>
        </form>
      </div>
    </div>
  )
}

export default Register
