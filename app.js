const Koa = require('koa'),
      bodyParser = require('koa-body'),
      render = require('koa-ejs'),
      path = require('path'),
      mongoose = require('mongoose'),
      sanitize = require('mongo-sanitize'),
      session = require('koa-session'),
      CSRF = require('koa-csrf')

const app = new Koa(),
      router = require('./router')


//error handling
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err){
    console.log(`Koa Error --> ${err}`);
    ctx.status = err.status || 500
    await ctx.render('error',{
      message: err
    })
  }
})


//MONGO DB
mongoose.connect('mongodb://localhost:27017/koa-auth', { useMongoClient: true })
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))

const User = require('./models/user')


//TEMPLATING ENGINE
render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout/page',
  viewExt: 'ejs',
  cache: false,
  debug: false
})


//MIDDLEWARES
app.use(bodyParser())
app.keys = ['mySecretPasswordHere']
app.use(session(app))

app.use(new CSRF({
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
  disableQuery: false
}))


//SERVE STATIC FILES
app.use(require('koa-static-server')({
  rootDir: 'static',
  rootPath: '/static'
}))


//redirect non-registered users to GET'/register' if they're accessing private pages; also redirect registered users to GET'/profile' if they're trying to access registration-login pages
app.use(async (ctx,next)=>{

  const publicUrls = ['/register','/login']

  if(!publicUrls.includes(ctx.request.url) && !ctx.session.user){
    return ctx.redirect('/register')

  } else if(publicUrls.includes(ctx.request.url) && ctx.session.user){
    return ctx.redirect('/profile')
  }

  await next()
})


// './router'
app.use(router.routes())
   .use(router.allowedMethods())



app.listen(8080)
