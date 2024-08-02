import React, { useState, useEffect, useRef } from 'react'
import styles from './Templates.module.css'
import { useNavigate } from 'react-router-dom'
import backendApis from '../../utils/backendApis'
import SurveyPreview from '../../components/Surveys/SurveyPreview'
import { useSurvey } from '../../components/context/SurveyContext'

const Templates = () => {
  const navigate = useNavigate()
  const { setLatestSurvey } = useSurvey()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentStepId, setCurrentStepId] = useState(null)
  const [showContainer, setShowContainer] = useState(true)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
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
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [history])

  const handleSendMessage = async () => {
    if (!message || isSending) return

    setIsSending(true)
    const userMessage = { role: 'user', parts: [{ text: message }] }
    setHistory((prevHistory) => [...prevHistory, userMessage])

    const loadingMessage = {
      role: 'model',
      parts: [{ text: '설문조사를 생성하고 있습니다!' }],
    }
    setHistory((prevHistory) => [...prevHistory, loadingMessage])
    setLoading(true)
    setMessage('')

    try {
      const result = await backendApis.startChatConversation(history, message)

      const [conversationPart, jsonPart] = result.split('////')

      const modelResponse = {
        role: 'model',
        parts: [{ text: conversationPart }],
      }
      setHistory((prevHistory) => {
        const newHistory = prevHistory.filter(
          (entry) => entry.parts[0].text !== '설문조사를 생성하고 있습니다!',
        )
        return [...newHistory, modelResponse]
      })

      setResponse(conversationPart)

      if (jsonPart) {
        try {
          const parsedData = JSON.parse(jsonPart)

          // 응답 객체를 로그로 출력하여 데이터를 검토합니다.
          console.log('Parsed Data:', parsedData)

          // ID와 steps가 있는지 확인합니다.
          if (parsedData.id && parsedData.steps) {
            setSelectedTemplate(parsedData)
            setCurrentStepId(parsedData.steps[0].id)

            // 최신 설문조사를 공유 상태에 저장
            setLatestSurvey(parsedData)
          } else {
            console.error('ID가 없습니다. 응답 형식을 확인하세요:', parsedData)
          }
        } catch (e) {
          console.error('JSON 파싱 실패:', e)
        }
      }
    } catch (error) {
      console.error('채팅 응답 가져오기 오류:', error)
    } finally {
      setLoading(false)
    }
    setIsSending(false)
    handleRefresh()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      const messageToSend = message.trim()
      setMessage('')
      handleSendMessage(messageToSend)
    }
  }

  const goBack = () => {
    navigate('/')
  }

  const handleRefresh = () => {
    if (selectedTemplate && selectedTemplate.steps.length > 0) {
      setCurrentStepId(selectedTemplate.steps[0].id)
    }
    setShowContainer(true)
  }

  const goToEditPage = () => {
    if (selectedTemplate) {
      // 설문조사 ID로 /edit/{id} 경로로 이동
      navigate(`/edit/${selectedTemplate.id}`)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton} onClick={goBack}>
          ◀︎ 뒤로가기
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
                          : '')
                  }
                  dangerouslySetInnerHTML={{ __html: entry.parts[0].text }}
                />
              ))}
            </div>
            <div className={styles.inputBox}>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
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
            {selectedTemplate && (
              <div className={styles.bigButton} onClick={goToEditPage}>
                설문조사 편집하기
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
