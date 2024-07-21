import styles from './EditingTriggers.module.css'
import { useState, useEffect, useRef } from 'react'

const EditingFirstVisit = ({ trigger, updateTrigger, setEditingTriggerId }) => {
  // 로컬 상태 설정
  const [title, setTitle] = useState(trigger.title)
  const [description, setDescription] = useState(trigger.description || '')
  const [pageType, setPageType] = useState(trigger.pageType)
  const [pageValue, setPageValue] = useState(trigger.pageValue || '')

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

  // 페이지 타입 변경 시 상태 업데이트
  const handlePageTypeChange = (newPageType) => {
    setPageType(newPageType)
    updateTrigger({ ...trigger, pageType: newPageType })
  }

  // 페이지 값 변경 시 상태 업데이트
  const handlePageValueChange = (e) => {
    const newPageValue = e.target.value
    setPageValue(newPageValue)
    updateTrigger({ ...trigger, pageValue: newPageValue })
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
      <div className={styles.title}>페이지 지정하기</div>
      <div className={styles.types}>
        <div
          className={`${styles.type} ${
            pageType === 'all' ? styles.selected : ''
          }`}
          onClick={() => handlePageTypeChange('all')}
        >
          모든 페이지
        </div>
        <div
          className={`${styles.type} ${
            pageType === 'specific' ? styles.selected : ''
          }`}
          onClick={() => handlePageTypeChange('specific')}
        >
          특정 페이지
        </div>
      </div>
      {pageType === 'specific' && (
        <>
          <div className={styles.title}>특정 페이지 URL 입력하기</div>
          <input
            type='text'
            value={pageValue}
            onChange={handlePageValueChange}
            placeholder='ex) /login'
            className={styles.input}
          />
        </>
      )}
    </div>
  )
}

export default EditingFirstVisit
