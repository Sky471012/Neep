const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const installmentSchema = new Schema({
  feeId: {
    type: Types.ObjectId,
    ref: "Fee",
    required: true,
  },
  studentId: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
  installmentNo: {
    type: Number,
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
  amount: {
    type: Number,
    required: true,
  },
});

module.exports = model("Installment", installmentSchema);