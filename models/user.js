const mongoose = require('mongoose')

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
  }
})


UserSchema.statics.authenticate = function(email,password,callback){
  return new Promise(function(resolve,reject){

    User.findOne({email})
    .exec(function(err,user){

      if(err){
        return reject(err)
      } else if(!user){
        const err = new Error('User not found')
        err.status = 401
        return reject(err)
      } else if(password !== user.password){
        const err = new Error('Password is not correct')
        err.status = 401
        return reject(err)
      }

      resolve({
        first: user.first,
        last: user.last,
        email: user.email
      })
    })
  })
}

//create a User model
const User = mongoose.model('User', UserSchema)

module.exports = User
