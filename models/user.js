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


//create a User model
const User = mongoose.model('User', UserSchema)

module.exports = User
