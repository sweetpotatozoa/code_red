const data = [
  {
    id: 1,
    title: '심층 인터뷰 요청',
    createAt: '2021.10.10',
    updatedAt: '2021.10.11',
    isDeploy: true,
    customerId: 1,
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
    title: '제품 만족도 조사',
    createAt: '2021.10.10',
    updatedAt: '2021.10.15',
    isDeploy: true,
    customerId: 1,
  },
  {
    id: 3,
    title: '고객 세그먼트 조사',
    createAt: '2021.10.10',
    updatedAt: '2021.10.12',
    isDeploy: true,
    customerId: 1,
  },
  {
    id: 4,
    title: '이탈방지',
    createAt: '2021.10.10',
    createdAt: '2021.10.13',
    isDeploy: true,
    customerId: 2,
  },
]

export default data
