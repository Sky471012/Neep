const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const adminTeacherSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  }, // "Admin" or "Teacher"
  // 🆕 Date of Birth
  dob: {
    type: String,
    required: false, // keep false so old data doesn't break
    validate: {
      validator: function (v) {
        if (!v) return true; // skip validation for existing docs without DOB
        return /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/.test(
          v
        );
      },
      message: "Date of birth must be in DD-MM-YYYY format",
    },
  },

  // 🆕 Address
  address: {
    type: String,
    required: false,
    trim: true,
  },

  // 🆕 Qualification
  qualification: {
    type: String,
    required: false,
    trim: true,
  },

  // 🆕 Aadhar Number (numeric string, exactly 12 digits)
  aadhar: {
    type: String,
    required: false,
    validate: {
      validator: function (v) {
        if (!v) return true; // allow old docs
        return /^[0-9]{12}$/.test(v);
      },
      message: "Aadhar number must be a 12-digit numeric value",
    },
  },

  // 🆕 Experience (in years)
  experience: {
    type: Number,
    required: false,
    min: [0, "Experience cannot be negative"],
  },
});

module.exports = model("AdminTeacher", adminTeacherSchema);
