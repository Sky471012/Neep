const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const feeSchema = new Schema({
  studentId: {
    type: Types.ObjectId,
    ref: "students",
    required: true,
  },
  month: {
    type: String, // e.g., "July 2025"
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paidOn: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Fee", feeSchema);