const mongoose = require('mongoose'),
      {promisify} = require('util')

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

  return User.findOne({email})
  .then(function(user){

    if(!user){
      throw 'User not found'
    } else if(password !== user.password){
      throw 'Password is not correct'
    }

    return {
      first: user.first,
      last: user.last,
      email: user.email
    }
  })
}

//create a User model
const User = mongoose.model('User', UserSchema)

module.exports = User
