const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const feeSchema = new Schema({
  installmentNo: {
    type: Number,
    required: true,
  },
  studentId: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
  dueDate: {
    type: String,
    required: true,
  },
  paidDate: {
    type: String,
    required: false,
  },
  method: {
    type: String,
    enum: ["Online", "Cash"],
    required: false,
  },
});

module.exports = model("Fee", feeSchema);