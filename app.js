const Koa = require('koa'),
      Router = require('koa-router'),
      bodyParser = require('koa-body'),
      render = require('koa-ejs'),
      path = require('path'),
      mongoose = require('mongoose'),
      session = require('koa-session'),
      CSRF = require('koa-csrf')

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



//ROUTER
const router = new Router()

router.get('/', async (ctx)=>{
  await ctx.render('home')
})


router.get('/register', async (ctx)=>{
  await ctx.render('register', {
    csrfToken: ctx.csrf
  })
})


router.post('/register', async (ctx)=>{

  const {first,last,email,password,confirmPassword} = ctx.request.body

  if(!(first && last && email && password && confirmPassword)){
    throw 'All fields are required'
  }

  if(password !== confirmPassword){
    throw 'Passwords must match'
  }

  //all fields fulfilled, create instance of User and save into DB
  try {

    const user = await User.create({
      first, last, email, password
    })

    ctx.session.user = {
      first: user.first,
      last: user.last,
      email: user.email,
      age: user.age,
      city: user.city
    }
    ctx.redirect('/profile')

  } catch(err){
    throw 'Error creating new user. Please try again'
  }
})


router.get('/login', async (ctx)=>{
  await ctx.render('login', {
    csrfToken: ctx.csrf
  })
})


router.post('/login', async (ctx)=>{

  const {email,password} = ctx.request.body
  if(!(email && password)){
    throw 'All fields are required'
  }

  try {

    const user = await User.authenticate(email, password)

    ctx.session.user = user
    ctx.redirect('/profile')

  } catch(err){
    throw err
  }
})


router.get('/profile', async (ctx)=>{
  if(!ctx.session.user){
    throw 'You are not authorized to see this page'
  }

  const {first,last,email,age,city} = ctx.session.user
  await ctx.render('profile', {
    first, last, email, age, city
  })
})


router.get('/edit', async (ctx)=>{
  if(!ctx.session.user){
    throw 'You are not authorized to see this page'
  }

  const {first,last,email,age,city} = ctx.session.user
  await ctx.render('editUser', {
    first, last, email, age, city,
    csrfToken: ctx.csrf
  })
})


router.post('/edit', async (ctx)=>{

  const {first,last,age,city} = ctx.request.body
  const {email} = ctx.session.user
  if(!(first && last)){
    throw 'First and Last name are required'
  }


  //const newUser = await User.edit({first,last,email,age,city})
  await User.update({email},{
    first,last,age,city
  })

  ctx.session.user = {
    first,last,email,age,city
  }
  ctx.redirect('/profile')
})


router.get('/delete', async (ctx)=>{
  if(!ctx.session.user){
    throw 'You are not authorized to see this page'
  }

  await ctx.render('deleteUser', {
    csrfToken: ctx.csrf
  })
})


router.post('/delete', async (ctx)=>{

  const {email} = ctx.session.user
  const {password} = ctx.request.body
  if(!password){
    throw 'Password is required for this operation'
  }

  //check if correct password provided
  const user = await User.authenticate(email, password)

  //if no errors happened --> user correctly authenticate so proceed deleting from database
  await User.remove({email: user.email})

  ctx.session.user = null
  ctx.redirect('/')
})


router.get('/logout', async (ctx)=>{
  ctx.session.user = null
  ctx.redirect('/')
})


//apply router
app.use(router.routes())
   .use(router.allowedMethods())



app.listen(8080)
