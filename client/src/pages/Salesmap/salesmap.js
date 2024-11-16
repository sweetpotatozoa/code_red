import { useNavigate } from 'react-router-dom'
import styles from './salesmap.module.css' // 일단 Home 스타일 재사용
import { useState } from 'react'

const Salesmap = () => {
  const [userInfo, setUserInfo] = useState('')
  const navigate = useNavigate()

  const goToHome = () => {
    navigate('/')
  }

  return (
    <div className={styles.container}>
      <div className={styles.sideBar}>
        <img
          src='/images/logo.svg'
          className={styles.logo}
          onClick={goToHome}
        ></img>
        <div className={styles.navBar}>
          <div className={styles.nav} onClick={goToHome}>
            설문조사
          </div>
        </div>
        <div className={styles.user}>
          <div className={styles.welcome}>
            안녕하세요,
            <br />
            {userInfo.realName}님!
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div
          id='salesmap-web-form'
          data-web-form='https://salesmap.kr/web-form/ebf2f1b5-b435-4ba0-9821-4b8c2ef31cb8'
          dangerouslySetInnerHTML={{
            __html: `
              <script>
                !(function (window, document) {
                  var currentScript = document.currentScript;
                  var scriptElement = document.createElement('script');
                  scriptElement.onload = function () {
                    window.SmFormSettings.loadForm();
                  };
                  scriptElement.id = 'loadFormScript';
                  scriptElement.src = 'https://salesmap.kr/web-form-loader-v3.js';
                  currentScript.parentNode.insertBefore(scriptElement, currentScript);
                })(window, document);
              </script>
            `,
          }}
        />
      </div>
    </div>
  )
}

export default Salesmap
