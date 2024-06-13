const express = require('express')
const compression = require('compression')
const nunjucks = require('nunjucks')
const cors = require('cors')
const path = require('path')

const configs = require('./src/utils/configs')
const mongodb = require('./src/utils/mongodb')
const indexRouter = require('./src/routes/index')
const exampleRouter = require('./src/routes/Example_Route')
const appliedSurveyRouter = require('./src/routes/Applied_Survey_Route')

const app = express()

// CORS 설정
app.use(cors())

// 기타 미들웨어 설정
app.use(compression())
app.use(express.json({ limit: '200mb' }))
app.use(
  express.urlencoded({
    limit: '200mb',
    extended: false,
    parameterLimit: 50000,
  }),
)

app.use(express.static(path.join(__dirname, 'public')))

// 템플릿 엔진 설정
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

nunjucks.configure('./src/views', {
  express: app,
  watch: true,
})

// 정적 파일 경로 설정
app.get('/survey.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'survey.js'))
})

app.get('/survey.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'survey.css'))
})

// 라우터 설정
app.use('/', indexRouter)
app.use('/example', exampleRouter)
app.use('/api/appliedSurvey', appliedSurveyRouter)

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// 데이터베이스 연결 후 서버 시작
mongodb.runAfterAllConnected(() => {
  app.listen(configs.port, () => {
    console.log(`Server is running on port ${configs.port}`)
  })
})
