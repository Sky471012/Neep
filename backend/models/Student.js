const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);
