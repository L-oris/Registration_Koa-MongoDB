const Router = require('koa-router')

const router = new Router()


router.get('/register', async (ctx)=>{
  await ctx.render('register', {
    csrfToken: ctx.csrf,
    errorMessage: ctx.session.errorMessage
  })

  //eventually reset error messages
  ctx.session.errorMessage = ''
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

    const user = await User.create(sanitize({
      first, last, email, password
    }))

    ctx.session.user = {
      first: user.first,
      last: user.last,
      email: user.email,
      age: user.age,
      city: user.city
    }
    ctx.redirect('/profile')

  } catch(err){
    ctx.session.errorMessage = 'Error creating new user. Please try again'
    ctx.redirect('/register')
  }
})


router.get('/login', async (ctx)=>{
  await ctx.render('login', {
    csrfToken: ctx.csrf,
    errorMessage: ctx.session.errorMessage
  })

  //eventually reset error messages
  ctx.session.errorMessage = ''
})


router.post('/login', async (ctx)=>{

  const {email,password} = ctx.request.body
  if(!(email && password)){
    throw 'All fields are required'
  }

  try {

    const user = await User.authenticate(sanitize({email, password}))

    ctx.session.user = user
    ctx.redirect('/profile')

  } catch(err){
    ctx.session.errorMessage = err
    ctx.redirect('/login')
  }
})


router.get('/profile', async (ctx)=>{

  const {first,last,email,age,city} = ctx.session.user
  await ctx.render('profile', {
    first, last, email, age, city,
    errorMessage: ctx.session.errorMessage
  })

  //eventually reset error messages
  ctx.session.errorMessage = ''
})


router.get('/edit', async (ctx)=>{

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

  await User.update({email},sanitize({
    first,last,age,city
  }))

  ctx.session.user = {
    first,last,email,age,city
  }
  ctx.redirect('/profile')
})


router.get('/delete', async (ctx)=>{

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

  try {

    //check if correct password provided
    const user = await User.authenticate(sanitize({email, password}))

    //if no errors happened --> user correctly authenticate so proceed deleting from database
    await User.remove({email: user.email})

    ctx.session.user = null
    ctx.redirect('/')

  } catch(err){
    ctx.session.errorMessage = err
    ctx.redirect('/profile')
  }
})


router.get('/logout', async (ctx)=>{
  ctx.session.user = null
  ctx.redirect('/')
})



module.exports = router
