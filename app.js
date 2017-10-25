const Koa = require('koa'),
      Router = require('koa-router'),
      bodyParser = require('koa-body')

const app = new Koa()

//MIDDLEWARES
app.use(bodyParser())

//ROUTER
const router = new Router()

router.get('/', async (ctx)=>{
  ctx.body = 'Hello World'
})

router.post('/postroute', async (ctx)=>{
  console.log(`Body received --> ${ctx.request.body}`)
  ctx.redirect('/')
})

//apply router
app.use(router.routes())
   .use(router.allowedMethods())


app.listen(8080)
