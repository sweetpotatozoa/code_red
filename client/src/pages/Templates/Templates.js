import styles from './Templates.module.css'

const Templates = () => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.bigButton}>◀︎ 뒤로가기</div>
      </div>
      <div className={styles.main}>
        <div className={styles.choice}>
          <div className={styles.mainTitle}>새 설문조사 만들기</div>
          <div className={styles.options}>
            <div className={styles.option}>
              <div className={styles.optionTitle}>커스텀 설문조사 만들기</div>
              <div className={styles.optionContent}>
                자유롭게 설문조사를 구성할 수 있습니다. <br></br>우리 서비스에
                가장 적합한 방법으로 인사이트를 획득 하세요!
              </div>
            </div>
            <div className={styles.option}>
              <div className={styles.optionTitle}>고객 세그먼트 파악하기</div>
              <div className={styles.optionContent}>
                유저 세그먼트 파악을 위한 기본적인 질문을 합니다.회사의 크기,
                유저의 역할과 유입결로 등을 통해 우리 서비스를 누가 쓰는지
                알아내세요!
              </div>
            </div>
            <div className={styles.option}>
              <div className={styles.optionTitle}>이탈고객 막기</div>
              <div className={styles.optionContent}>
                서비스를 해지하는 사유를 알아내고 이탈을 막습니다. 사용 난이도,
                가격, CS 등 다양한 이탈사유를 알아내고 이탈하려는 고객을 지금
                즉시 붙잡으세요!
              </div>
            </div>
            <div className={styles.option}>
              <div className={styles.optionTitle}>유료전환 이끌어내기</div>
              <div className={styles.optionContent}>
                전환하지 않는 유저에게 이유를 묻고 전환을 유도합니다. 유저가
                어떤 생각으로 체험판을 사용했고, 염두에 두고 있는 경쟁 제품이
                무엇인지 알아내세요!
              </div>
            </div>
            <div className={styles.option}>
              <div className={styles.optionTitle}>인터뷰 요청하기</div>
              <div className={styles.optionContent}>
                유저에게 심층 인터뷰를 요청합니다. 신기능이나 예상되는 병목
                지점을 지나는 유저에게 심층 인터뷰를 요청해 인사이트를 얻으세요!
              </div>
            </div>
          </div>
        </div>
        <div className={styles.display}>
          <div className={styles.website}>
            <div className={styles.top}>
              <img src='/images/mac.png' className={styles.macButton}></img>
              <div className={styles.yourWeb}>나의 서비스</div>
            </div>
          </div>
          <div className={styles.bottom}>
            <div className={styles.bigButton}>새로고침</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates
