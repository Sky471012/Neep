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
  },
  dob: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate DD-MM-YYYY format
        return /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/.test(v);
      },
      message: 'Date of birth must be in DD-MM-YYYY format'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Student", studentSchema);