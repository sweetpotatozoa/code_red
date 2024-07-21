import styles from './EditingTriggers.module.css'
import { useState, useRef, useEffect } from 'react'

const EditingUrl = ({ trigger, updateTrigger, setEditingTriggerId }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(trigger.title)
  const [description, setDescription] = useState(trigger.description || '')
  const [url, setUrl] = useState(trigger.url || '')

  // 제목 변경 시 상태 업데이트
  const handleTitleChange = (e) => {
    const newTitle = e.target.value
    setTitle(newTitle)
    updateTrigger({ ...trigger, title: newTitle })
  }

  // 설명 변경 시 상태 업데이트
  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value
    setDescription(newDescription)
    updateTrigger({ ...trigger, description: newDescription })
  }

  // URL 변경 시 상태 업데이트
  const handleUrlChange = (e) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    updateTrigger({ ...trigger, url: newUrl })
  }

  // 외부 클릭을 감지하여 편집 모드를 닫기 위한 레퍼런스 설정
  const editorRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (editorRef.current && !editorRef.current.contains(event.target)) {
        setEditingTriggerId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setEditingTriggerId])

  return (
    <div ref={editorRef}>
      <div className={styles.title}>제목</div>
      <input
        type='text'
        value={title}
        onChange={handleTitleChange}
        placeholder='제목을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>설명</div>
      <input
        type='text'
        value={description}
        onChange={handleDescriptionChange}
        placeholder='설명을 입력하세요.'
        className={styles.input}
      />
      <div className={styles.title}>URL</div>
      <input
        type='text'
        value={url}
        onChange={handleUrlChange}
        placeholder='URL을 입력하세요. ex) /login'
        className={styles.input}
      />
    </div>
  )
}

export default EditingUrl
