const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const adminTeacherSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true 
  },
  phone: {
    type: String,
    required: true 
  },
  role: {
    type: String,
    required: true 
  }, // "Admin" or "Teacher"
});

module.exports = model("AdminTeacher", adminTeacherSchema);