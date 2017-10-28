const Koa = require('koa'),
      Router = require('koa-router'),
      bodyParser = require('koa-body'),
      render = require('koa-ejs'),
      path = require('path'),
      mongoose = require('mongoose'),
      session = require('koa-session')

const app = new Koa()


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


//SERVE STATIC FILES
app.use(require('koa-static-server')({
  rootDir: 'static',
  rootPath: '/static'
}))



//ROUTER
const router = new Router()

router.get('/', async (ctx)=>{
  await ctx.render('home')
})


router.get('/register', async (ctx)=>{
  await ctx.render('register')
})


router.post('/register', async (ctx,next)=>{

  const {first,last,email,password,confirmPassword} = ctx.request.body

  if(!(first && last && email && password && confirmPassword) && !(password !== confirmPassword)){
    throw 'All fields are required. Passwords must match'
  }

  //all fields fulfilled, create instance of User and save into DB
  try {

    const user = await User.create({
      first, last, email, password
    })
    ctx.session.user = user
    ctx.redirect('/secret')

  } catch(err){
    throw 'Issues saving user into DB'
  }
})


router.get('/login', async (ctx)=>{
  await ctx.render('login')
})


router.post('/login', async (ctx)=>{

  const {email,password} = ctx.request.body
  if(!(email && password)){
    throw 'All fields are required'
  }

  try {

    const user = await User.authenticate(email, password)

    ctx.session.user = user
    await ctx.render('secret',{
      first: user.first,
      last: user.last,
      email: user.email
    })

  } catch(err){
    throw err
  }
})


router.get('/secret', async (ctx)=>{
  if(!ctx.session.user){
    throw 'You are not authorized to see this page'
  }

  const {first,last,email} = ctx.session.user
  await ctx.render('secret', {
    first, last, email
  })
})


router.get('/logout', async (ctx)=>{
  ctx.session.user = null
  ctx.redirect('/')
})


//apply router
app.use(router.routes())
   .use(router.allowedMethods())



app.listen(8080)
