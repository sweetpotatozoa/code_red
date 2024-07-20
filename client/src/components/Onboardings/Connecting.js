import styles from './Onboarding.module.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import backendApis from '../../utils/backendApis'
import { useState, useEffect } from 'react'

const Connecting = ({ setCurrentStep, setOnboardingInfo }) => {
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('waiting') // 'waiting', 'connected', 'timeout'
  const [loadingDots, setLoadingDots] = useState('.')

  // 유저아이디 가져오기
  useEffect(() => {
    const getId = async () => {
      try {
        const result = await backendApis.getId()
        setUserId(result.userId)
        setLoading(false)
      } catch (error) {
        setConnectionStatus('error')
        setLoading(false)
      }
    }
    getId()
  }, [])

  // 설문조사 상태 확인
  useEffect(() => {
    if (!userId || connectionStatus !== 'waiting') return

    const checkConnect = async () => {
      try {
        const result = await backendApis.checkConnect()
        if (result) {
          setConnectionStatus('connected')
          setCurrentStep((prevStep) => prevStep + 1)
          setOnboardingInfo((prevInfo) => ({
            ...prevInfo,
            isConnect: true,
            isOnboarding: true,
          }))
        }
      } catch (error) {
        console.error('설문조사 상태 확인 중 오류 발생:', error)
      }
    }

    const intervalId = setInterval(checkConnect, 5000) // 5초마다 확인

    // 30분 후에 interval 중지
    const timeoutId = setTimeout(
      () => {
        clearInterval(intervalId)
        setConnectionStatus('timeout')
      },
      30 * 60 * 1000,
    ) // 30분

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [userId, setCurrentStep, setOnboardingInfo, connectionStatus])

  // 로딩 애니메이션
  useEffect(() => {
    if (connectionStatus !== 'waiting') return

    const animateDots = () => {
      setLoadingDots((prev) => {
        if (prev.length >= 3) return '.'
        return prev + '.'
      })
    }

    const animationId = setInterval(animateDots, 500) // 0.5초마다 점 업데이트

    return () => clearInterval(animationId)
  }, [connectionStatus])

  // 코드 복사하기 기능
  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode)
    alert('코드가 클립보드에 복사되었습니다.')
  }

  // 삽입 스크립트
  const scriptCode = userId
    ? `<script type="text/javascript">
      (function() {
        var t = document.createElement("script");
        t.type = "text/javascript";
        t.async = !0;
        t.src = "https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app/survey.js";
        var e = document.getElementsByTagName("script")[0];
        e.parentNode.insertBefore(t, e);

        t.onload = function() {
          setTimeout(function() {
            window.CatchTalk.init({
              environmentId: "${userId}",
              apiHost: "https://port-0-codered-ss7z32llwexb5xe.sel5.cloudtype.app"
            });
          }, 500);
        };
      })();
    </script>`
    : ''

  const getStatusMessage = () => {
    switch (connectionStatus) {
      case 'connected':
        return '연결되었습니다!'
      case 'timeout':
        return '연결 시간이 초과되었습니다. 새로고침 후 다시 시도해주세요.'
      case 'error':
        return '서버에 문제가 생겼습니다. 나중에 다시 시도해주세요.'
      default:
        return `연결 신호 기다리는 중${loadingDots}`
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>웹앱 혹은 웹사이트에 연결하세요</div>
      <div className={styles.description}>
        아래 스크립트를 삽입하면 바로 연결됩니다!
      </div>
      <div className={styles.contents}>
        <div className={styles.waiting}>{getStatusMessage()}</div>
        <div className={styles.info}>
          아래 스크립트를 여러분의 웹사이트 <b>HTML</b> 파일의{' '}
          <b>&lt;head&gt;</b> 태그 내부에 삽입해주세요.
        </div>
        <div className={styles.info}>
          삽입이 완료되었다면 고객님의 웹사이트 주소 뒤에{' '}
          <b>#checkConnection</b>을 붙여 접속해주세요. <br />
        </div>
        <div className={styles.info}>ex) www.yoursite.com/#checkConnection</div>
        {!loading && (
          <SyntaxHighlighter
            language='javascript'
            style={prism}
            className={styles.syntaxHighlighter}
          >
            {scriptCode}
          </SyntaxHighlighter>
        )}
        <div className={styles.buttons}>
          <button
            style={{ backgroundColor: '#172134', color: '#ffffff' }}
            onClick={handleCopy}
          >
            코드 복사하기
          </button>
          <a
            href='https://zenith-income-03c.notion.site/1-079333926e1c44899b4d44ab50a98a83/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <button>상세가이드 보러가기</button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Connecting
