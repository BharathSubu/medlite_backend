const mongoose = require("mongoose");

//schema to be followed when creating a new user

const Schema = mongoose.Schema;

const PUser = Schema({
  name: String,
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  
  phone: {
    type: String ,
    required: true,
  },
  img: {
    type: String,
    default: "null",
  },
  attribute : [
    { variable: String, value: String }
  ],
  doctors: [{
    type: String
   }],
  requests : [{
    type: String
  }],
  
});

module.exports = mongoose.model("PUser", PUser);
