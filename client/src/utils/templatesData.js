const templatesData = [
  {
    id: 1,
    title: '커스텀 설문조사 만들기',
    description:
      '자유롭게 설문조사를 구성할 수 있습니다. 우리 서비스에 가장 적합한 방법으로 인사이트를 획득 하세요!',
    createAt: '2021.10.10',
    updatedAt: '2021.10.11',
    isDeploy: true,
    questions: [
      {
        id: 1,
        order: 0,
        type: 'welcome',
        title: '저희 서비스 이용이 처음이시군요!',
        description: '설문조사에 참여해주실래요?',
        isActive: true,
      },
      {
        id: 2,
        order: 1,
        type: 'singleChoice',
        title: '회사에서의 역할은 무엇입니까?',
        description: '솔직하게 응답해주세요',
        options: [
          {
            id: 1,
            value: 'CEO',
            nextQuestionId: 3,
          },
          {
            id: 2,
            value: 'CTO',
            nextQuestionId: 3,
          },
          {
            id: 3,
            value: 'CFO',
            nextQuestionId: 3,
          },
          {
            id: 4,
            value: 'CPO',
            nextQuestionId: 3,
          },
        ],
      },
      {
        id: 3,
        order: 2,
        type: 'link',
        title: '세상에 대표님이시군요!',
        description: '아래 링크를 눌러 제발 저희와 인터뷰 일정을 잡아주세요',
        url: 'https://www.naver.com',
      },
      {
        id: 4,
        order: 3,
        type: 'freeText',
        title: '와! 개발자시군요!',
        description: '저희 제품에 대한 피드백을 주세요.',
        nextQuestionId: 5,
      },
      {
        id: 5,
        order: 4,
        type: 'rating',
        title: 'CFO라구요?',
        description: '저희 제품의 가격에 대해 어떻게 생각하세요?',
      },
      {
        id: 6,
        order: 5,
        type: 'multipleChoice',
        title: 'CPO라니!',
        description: '저희 제품을 사용하시는 이유가 뭐죠?',
        nextQuestionId: 7,
        options: [
          {
            id: 1,
            value: '기능',
          },
          {
            id: 2,
            value: '디자인',
          },
          {
            id: 3,
            value: '가격',
          },
          {
            id: 4,
            value: '편의성',
          },
        ],
      },
      {
        id: 7,
        order: 6,
        type: 'thank',
        title: '수고하셨습니다!',
        description: '설문조사에 참여해주셔서 감사합니다.',
        isActive: true,
      },
    ],
    triggers: [
      {
        id: 1,
        type: 'firstVisit',
        title: '첫 방문',
        description: '처음으로 방문했을 때',
      },
      {
        id: 2,
        type: 'click',
        title: '클릭',
        description: '클릭했을 때',
      },
      {
        id: 3,
        type: 'scroll',
        title: '스크롤',
        description: '스크롤했을 때',
      },
    ],
    delay: {
      delayType: 'once',
      delayValue: 1,
    },
  },
  {
    id: 2,
    title: '고객 세그먼트 파악하기',
    description:
      '유저 세그먼트 파악을 위한 기본적인 질문을 합니다. 회사의 크기, 유저의 역할과 유입결로 등을 통해 우리 서비스를 누가 쓰는지 알아내세요!',
  },
  {
    id: 3,
    title: '이탈고객 막기',
    description:
      '서비스를 해지하는 사유를 알아내고 이탈을 막습니다. 사용 난이도, 가격, CS 등 다양한 이탈사유를 알아내고 이탈하려는 고객을 지금 즉시 붙잡으세요!',
  },
  {
    id: 4,
    title: '유료전환 이끌어내기',
    description:
      '전환하지 않는 유저에게 이유를 묻고 전환을 유도합니다. 유저가 어떤 생각으로 체험판을 사용했고, 염두에 두고 있는 경쟁 제품이 무엇인지 알아내세요!',
  },
  {
    id: 5,
    title: '인터뷰 요청하기',
    description:
      '유저에게 심층 인터뷰를 요청합니다. 신기능이나 예상되는 병목 지점을 지나는 유저에게 심층 인터뷰를 요청해 인사이트를 얻으세요!',
  },
]

export default templatesData
