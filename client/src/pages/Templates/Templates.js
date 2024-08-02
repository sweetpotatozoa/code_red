import styles from './Templates.module.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import backendApis from '../../utils/backendApis'
import SurveyPreview from '../../components/Surveys/SurveyPreview'

const Templates = () => {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentStepId, setCurrentStepId] = useState(null)
  const [showContainer, setShowContainer] = useState(true)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false) // 로딩 상태 추가
  const [isSending, setIsSending] = useState(false)
  const [history, setHistory] = useState([
    { role: 'user', parts: [{ text: '설문조사 만드는 걸 도와줄래?' }] },
    {
      role: 'model',
      parts: [
        {
          text: '안녕하세요? 저에게 고민을 말씀해주시면 설문조사 생성을 도와드릴게요 :)',
        },
      ],
    },
  ])

  const chatLogRef = useRef(null)

  useEffect(() => {
    // history가 변경될 때마다 스크롤을 아래로 이동
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [history])

  const handleSendMessage = async () => {
    if (!message || isSending) return

    setIsSending(true) // 전송 중 상태로 설정
    const userMessage = { role: 'user', parts: [{ text: message }] }
    setHistory((prevHistory) => [...prevHistory, userMessage])

    // 로딩 메시지 추가
    const loadingMessage = {
      role: 'model',
      parts: [{ text: '설문조사를 생성하고 있습니다!' }],
    }
    setHistory((prevHistory) => [...prevHistory, loadingMessage])
    setLoading(true) // 로딩 시작
    setMessage('') // 메시지 초기화

    try {
      const result = await backendApis.startChatConversation(history, message)

      console.log('result:', result)

      // 응답을 '////'를 기준으로 분리
      const [conversationPart, jsonPart] = result.split('////')

      console.log('jsonPart:', jsonPart)

      // 실제 응답을 히스토리에 추가
      const modelResponse = {
        role: 'model',
        parts: [{ text: conversationPart }],
      }
      setHistory((prevHistory) => {
        // 로딩 메시지를 제거하고 실제 응답을 추가
        const newHistory = prevHistory.filter(
          (entry) => entry.parts[0].text !== '설문조사를 생성하고 있습니다!',
        )
        return [...newHistory, modelResponse]
      })

      setResponse(conversationPart)

      // JSON 부분을 파싱하여 설문조사 미리보기에 반영
      if (jsonPart) {
        try {
          const parsedData = JSON.parse(jsonPart)
          if (parsedData.steps) {
            setSelectedTemplate(parsedData)
            setCurrentStepId(parsedData.steps[0].id) // 첫 번째 스텝의 ID 설정
          }
        } catch (e) {
          console.error('Failed to parse JSON:', e)
        }
      }
    } catch (error) {
      console.error('Error fetching chat response:', error)
    } finally {
      setLoading(false) // 로딩 완료
    }
    setIsSending(false) // 전송 중 상태 해제
    handleRefresh()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const messageToSend = message.trim() // 혹시 모를 공백 제거
      setMessage('') // 메시지 입력창을 즉시 지움
      handleSendMessage(messageToSend) // 메시지 전송
    }
  }

  // 뒤로가기 버튼
  const goBack = () => {
    navigate('/')
  }

  // 새로고침
  const handleRefresh = () => {
    if (selectedTemplate && selectedTemplate.steps.length > 0) {
      setCurrentStepId(selectedTemplate.steps[0].id)
    }
    setShowContainer(true)
  }

  // 저장하고 edit 페이지로 이동
  const handleSave = async () => {
    if (selectedTemplate) {
      try {
        const surveyId = await backendApis.createSurveyWithAi(selectedTemplate)
        navigate(`/edit/${surveyId}`)
      } catch (err) {
        console.error('Failed to save survey:', err)
        alert('설문조사 저장에 실패했습니다.')
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton} onClick={goBack}>
          ◀︎ 뒤로가기
        </div>
        <div className={styles.bigButtonBlack} onClick={goBack}>
          다음 ▶️
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.mainTitle}>AI와 함께 설문조사 만들기</div>
          <div>
            <div ref={chatLogRef} className={styles.chatLog}>
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={
                    entry.role === 'user'
                      ? styles.userMessage
                      : styles.modelMessage +
                        (entry.parts[0].text.includes(
                          '설문조사를 생성하고 있습니다!',
                        )
                          ? ` ${styles.loadingMessage}`
                          : '') // 로딩 메시지일 경우 애니메이션 적용
                  }
                  dangerouslySetInnerHTML={{ __html: entry.parts[0].text }} // HTML을 렌더링하도록 설정
                />
              ))}
            </div>
            <div className={styles.inputBox}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown} // 엔터 키 이벤트 핸들러 추가
                placeholder='메세지를 입력하세요!'
                className={styles.input}
              />
              <button className={styles.sendButton} onClick={handleSendMessage}>
                전송
              </button>
            </div>
          </div>
        </div>
        <div className={styles.display}>
          <div className={styles.website}>
            <div className={styles.top}>
              <img
                src='/images/mac.svg'
                className={styles.macButton}
                alt='Mac button'
              />
              <div className={styles.yourWeb}>나의 서비스</div>
            </div>
            {selectedTemplate && (
              <SurveyPreview
                key={currentStepId} // 이 부분을 추가하여 key로 강제 리렌더링을 유도
                selectedTemplate={selectedTemplate}
                currentStepId={currentStepId}
                setCurrentStepId={setCurrentStepId}
                showContainer={showContainer}
                setShowContainer={setShowContainer}
              />
            )}
          </div>
          <div className={styles.bottom}>
            <div className={styles.bigButton} onClick={handleRefresh}>
              새로고침
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
