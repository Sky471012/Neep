const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const studentSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dob: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/.test(v);
      },
      message: "Date of birth must be in DD-MM-YYYY format",
    },
  },
  address: {
    type: String,
  required: true
},
  class: {
    type: String,
    enum: ["Kids", "English Spoken", "9", "10", "11", "12"],
    required: true,
  },
  dateOfJoining: {
    type: String,
    required: true,
  },
});

module.exports = model("Student", studentSchema);