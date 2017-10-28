const mongoose = require('mongoose'),
      bcrypt = require('bcrypt')

//create a schema for data that we wanna store
const UserSchema = new mongoose.Schema({
  first: {
    type: String,
    required: true,
    trim: true
  },
  last: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    trim: true
  },
  city: {
    type: String,
    trim: true
  }
})


//hash password before saving into database
UserSchema.pre('save', function(next){

  const user = this
  bcrypt.hash(user.password, 10, function(err, hash){

    if(err){
      return next(err)
    }

    //override cleartext password with hashed one
    user.password = hash
    next()
  })
})


UserSchema.statics.authenticate = async function(email,password){

    const user = await User.findOne({email})

    if(!user){
      throw `User not found`
    }

    const isValidPassword = await bcrypt.compare(password,user.password)
    if(!isValidPassword){
      throw `Password is not correct`
    }

    return {
      first: user.first,
      last: user.last,
      email: user.email,
      age: user.age,
      city: user.city
    }
}


// UserSchema.statics.edit = async function({first,last,email,age,city}){
//
//   const currentUser = await User.findOne({email})
//
//   if(!currentUser){
//     throw `User not found`
//   }
//
//   currentUser.set({
//     first,last,age,city
//   })
//
//   console.log(`now current user --> `);
//   console.dir(currentUser);
//
//   const updatedUser = await currentUser.save()
//
//   console.log(`now updatedUser`);
//   console.dir(updatedUser);
//
//   return {
//     first: updatedUser.first,
//     last: updatedUser.last,
//     email: updatedUser.email,
//     age: updatedUser.age,
//     city: updatedUser.city
//   }
// }

//create a User model
const User = mongoose.model('User', UserSchema)

module.exports = User
