import styles from './Templates.module.css'
import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import backendApis from '../../utils/backendApis'
import SurveyPreview from '../../components/Surveys/SurveyPreview'

const Templates = () => {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [currentStepId, setCurrentStepId] = useState(null)
  const [showContainer, setShowContainer] = useState(true)
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState('')
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
    if (!message) return

    const userMessage = { role: 'user', parts: [{ text: message }] }
    setHistory((prevHistory) => [...prevHistory, userMessage])

    const result = await backendApis.startChatConversation(history, message)

    // 응답을 '/////'를 기준으로 분리
    const [conversationPart, jsonPart] = result.split('/////')

    // 대화 부분을 히스토리에 추가
    const modelResponse = { role: 'model', parts: [{ text: conversationPart }] }
    setHistory((prevHistory) => [...prevHistory, modelResponse])

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

    setMessage('')
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSendMessage()
    }
  }

  // 뒤로가기 버튼
  const goBack = () => {
    navigate('/')
  }

  // 템플릿 1차 선택(미리보기)
  const templateClickHandler = (template) => {
    setSelectedTemplate(template)
    setCurrentStepId(template.steps[0].id) // 첫 번째 스텝의 ID로 설정
    setShowContainer(true)
  }

  // 템플릿 고르고 선택하기 버튼 눌러서 실제로 설문조사 생성하면서 edit페이지로 이동
  const createSurvey = async () => {
    if (selectedTemplate) {
      try {
        const surveyId = await backendApis.createSurvey(selectedTemplate.id)
        navigate(`/edit/${surveyId}`)
      } catch (error) {
        console.error('설문조사 생성 실패', error)
        alert('설문조사 생성에 실패했습니다.')
      }
    }
  }

  // 새로고침
  const handleRefresh = () => {
    if (selectedTemplate && selectedTemplate.steps.length > 0) {
      setCurrentStepId(selectedTemplate.steps[0].id)
    }
    setShowContainer(true)
  }

  //템플릿 가져오기
  useEffect(() => {
    const getTemplates = async () => {
      try {
        const result = await backendApis.getTemplates()
        setTemplates(result)
        if (result.length > 0) {
          setSelectedTemplate(result[0])
          setCurrentStepId(result[0].steps[0].id) // 첫 번째 템플릿의 첫 번째 스텝 ID로 설정
        }
      } catch (error) {
        console.error('템플릿 가져오기 실패', error)
        alert('템플릿 가져오기에 실패했습니다.')
      }
    }
    getTemplates()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton} onClick={goBack}>
          ◀︎ 뒤로가기
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.mainTitle}>새 설문조사 만들기</div>
          <div>
            <h1>Chat with AI</h1>
            <div ref={chatLogRef} className={styles.chatLog}>
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={
                    entry.role === 'user'
                      ? styles.userMessage
                      : styles.modelMessage
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
