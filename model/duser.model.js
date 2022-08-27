const mongoose = require("mongoose");

//schema to be followed when creating a new user

const Schema = mongoose.Schema;

const DUser = Schema({

  name: String,
  password: {
    type: String,
    required: true,
  },
  about: {
    default:"",
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  role: {
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
  attribute : [{
    type: String
}],
requests : [{
  type: String
}],
  
  patients: [{
      type: String
  }]
  
});

module.exports = mongoose.model("DUser", DUser);
