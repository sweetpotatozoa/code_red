import styles from './AddTriggerModal.module.css'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

const AddTriggerModal = ({ setIsAddTrigger, survey, setSurvey }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('firstVisit')
  const [clickType, setClickType] = useState('css')
  const [clickValue, setClickValue] = useState('')
  const [pageType, setPageType] = useState('all')
  const [pageValue, setPageValue] = useState('')

  const addTriggerHandler = () => {
    if (!title) {
      alert('제목을 입력해주세요!')
      return
    }
    if (type === 'click' && !clickValue) {
      alert('어떤 요소를 클릭할 때 발동할지 입력해주세요!')
      return
    }
    if (pageType === 'specific' && !pageValue) {
      alert('페이지 url을 입력해주세요!')
      return
    }
    const newTrigger = {
      id: uuidv4(),
      type: type,
      title: title,
      description: description,
      clickType: clickType,
      clickValue: clickValue,
      pageType: pageType,
      pageValue: pageValue,
    }
    const updatedSurvey = {
      ...survey,
      triggers: [...(survey.triggers || []), newTrigger],
    }
    setSurvey(updatedSurvey)
    setIsAddTrigger(false)
  }

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalTitle}>새로운 트리거 추가하기</div>
        <div className={styles.triggerInputs}>
          <div className={styles.inputTitle}>제목</div>
          <input
            className={styles.input}
            placeholder='제목을 입력해주세요!'
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className={styles.inputTitle}>부가설명</div>
          <input
            className={styles.input}
            placeholder='ex)상세페이지에서 구매 버튼을 눌렀을 때'
            type='text'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className={styles.inputTitle}>트리거 유형</div>
          <div className={styles.triggerTypes}>
            <div
              className={`${styles.triggerType} ${
                type === 'firstVisit' ? styles.selected : ''
              }`}
              onClick={() => setType('firstVisit')}
            >
              첫 방문
            </div>
            <div
              className={`${styles.triggerType} ${
                type === 'url' ? styles.selected : ''
              }`}
              onClick={() => setType('url')}
            >
              URL
            </div>
            <div
              className={`${styles.triggerType} ${
                type === 'click' ? styles.selected : ''
              }`}
              onClick={() => setType('click')}
            >
              클릭
            </div>
            <div
              className={`${styles.triggerType} ${
                type === 'exit' ? styles.selected : ''
              }`}
              onClick={() => setType('exit')}
            >
              이탈
            </div>
            <div
              className={`${styles.triggerType} ${
                type === 'scroll' ? styles.selected : ''
              }`}
              onClick={() => setType('scroll')}
            >
              스크롤
            </div>
          </div>

          {type === 'click' && (
            <>
              <div className={styles.inputTitle}>클릭버튼 지정하기</div>
              <div className={styles.triggerTypes}>
                <div
                  className={`${styles.triggerType} ${
                    clickType === 'css' ? styles.selected : ''
                  }`}
                  onClick={() => setClickType('css')}
                  style={{ width: '300px' }}
                >
                  CSS로 선택하기
                </div>
                <div
                  className={`${styles.triggerType} ${
                    clickType === 'text' ? styles.selected : ''
                  }`}
                  onClick={() => setClickType('text')}
                  style={{ width: '300px' }}
                >
                  텍스트로 선택하기
                </div>
              </div>
              <input
                className={styles.input}
                placeholder='ex) .class, #id'
                type='text'
                value={clickValue}
                onChange={(e) => setClickValue(e.target.value)}
              />
            </>
          )}

          <div className={styles.inputTitle}>페이지 지정하기</div>
          <div className={styles.triggerTypes}>
            <div
              className={`${styles.triggerType} ${
                pageType === 'all' ? styles.selected : ''
              }`}
              onClick={() => setPageType('all')}
              style={{ width: '305px' }}
            >
              모든 페이지
            </div>
            <div
              className={`${styles.triggerType} ${
                pageType === 'specific' ? styles.selected : ''
              }`}
              onClick={() => setPageType('specific')}
              style={{ width: '300px' }}
            >
              특정 페이지
            </div>
          </div>
          {pageType === 'specific' && (
            <input
              className={styles.input}
              placeholder='페이지 url을 입력해주세요!'
              type='text'
              value={pageValue}
              onChange={(e) => setPageValue(e.target.value)}
            />
          )}
        </div>

        <div className={styles.modalButtons}>
          <div
            className={styles.modalButton}
            style={{ backgroundColor: '#E2E8F0', color: '#ffffff' }}
            onClick={() => setIsAddTrigger(false)}
          >
            취소
          </div>
          <div className={styles.modalButton} onClick={addTriggerHandler}>
            추가하기
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddTriggerModal
