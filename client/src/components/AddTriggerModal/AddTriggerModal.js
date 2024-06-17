import styles from './AddTriggerModal.module.css'
import { useState } from 'react'

const AddTriggerModal = ({ setIsaddTrigger }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalTitle}>새로운 트리거 추가하기</div>
        <div className={styles.triggerInputs}>
          <div className={styles.inputTitle}>제목</div>
          <input className={styles.input} placeholder='제목을 입력해주세요!' />
          <div className={styles.inputTitle}>부가설명</div>
          <input
            className={styles.input}
            placeholder='ex)상세페이지에서 구매 버튼을 눌렀을 때'
          />
          <div className={styles.inputTitle}>트리거 유형</div>
          <div className={styles.triggerTypes}>
            <div className={styles.triggerType}>첫 방문</div>
            <div className={styles.triggerType}>URL</div>
            <div className={styles.triggerType}>클릭</div>
            <div className={styles.triggerType}>이탈</div>
            <div className={styles.triggerType}>스크롤</div>
          </div>
          <div className={styles.inputTitle}>클릭</div>
          <div className={styles.explain}>
            무언가를 클릭했을 때 설문조사가 나오게 합니다.
          </div>
          <div className={styles.inputTitle}>클릭버튼 지정하기</div>
          <div className={styles.triggerTypes}>
            <div className={styles.triggerType} style={{ width: '300px' }}>
              CSS로 선택하기
            </div>
            <div className={styles.triggerType} style={{ width: '300px' }}>
              텍스트로 선택하기
            </div>
          </div>
          <input className={styles.input} placeholder='ex) .class, #id' />
          <div className={styles.inputTitle}>페이지 지정하기</div>
          <div className={styles.triggerTypes}>
            <div className={styles.triggerType} style={{ width: '300px' }}>
              모든 페이지
            </div>
            <div className={styles.triggerType} style={{ width: '300px' }}>
              특정 페이지
            </div>
          </div>
          <input
            className={styles.input}
            placeholder='페이지 url을 입력해주세요!'
          />
        </div>
        <div className={styles.modalButtons}>
          <div
            className={styles.modalButton}
            style={{ backgroundColor: '#E2E8F0', color: '#ffffff' }}
            onClick={() => setIsaddTrigger(false)}
          >
            취소
          </div>
          <div className={styles.modalButton}>추가하기</div>
        </div>
      </div>
    </div>
  )
}

export default AddTriggerModal
