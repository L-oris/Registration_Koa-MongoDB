const Koa = require('koa'),
      Router = require('koa-router'),
      bodyParser = require('koa-body'),
      render = require('koa-ejs'),
      path = require('path')

const app = new Koa()


//error handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500
    ctx.body = err.message
    ctx.app.emit('error', err, ctx)
  }
})


//TEMPLATING ENGINE
render(app, {
  root: path.join(__dirname, 'views'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false
})

//MIDDLEWARES
app.use(bodyParser())

//SERVE STATIC FILES
app.use(require('koa-static-server')({
  rootDir: 'static',
  rootPath: '/static'
}))

//ROUTER
const router = new Router()

router.get('/', async (ctx)=>{
  // ctx.body = "Hello There"
  await ctx.render('home')
})

router.post('/postroute', async (ctx)=>{
  console.log(`Body received --> ${ctx.request.body}`)
  ctx.redirect('/')
})

//apply router
app.use(router.routes())
   .use(router.allowedMethods())


app.listen(8080)
