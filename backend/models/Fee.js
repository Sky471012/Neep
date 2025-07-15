const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const feeSchema = new Schema({
  studentId: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
    unique: true, // one fee record per student
  },
  totalAmount: {
    type: Number,
    required: true,
  },
});

module.exports = model("Fee", feeSchema);