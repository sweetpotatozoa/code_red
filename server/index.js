const express = require('express')
const app = express()
const compression = require('compression')
const nunjucks = require('nunjucks')
const cors = require('cors')
const path = require('path')

const configs = require('./src/utils/configs')
const mongodb = require('./src/utils/mongodb')
const indexRouter = require('./src/routes/index')
const exampleRouter = require('./src/routes/Example_Route')

app.use(cors())
app.set('view engine', 'ejs')
app.engine('html', require('ejs').renderFile)

nunjucks.configure('./src/views', {
  express: app,
  watch: true,
})

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

app.use('/', indexRouter)
app.use('/example', exampleRouter)

mongodb.runAfterAllConnected(() => {
  app.listen(configs.port, () => {
    console.log(`Server is running on port ${configs.port}`)
  })
})
