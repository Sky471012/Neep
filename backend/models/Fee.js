const mongoose = require("mongoose");

const { Schema } = mongoose;

const feeSchema = new Schema({
  _id: ObjectId,
  studentId: {
    type: ObjectId,
    ref: "students",
    required: true,
  },
  month: {
    type: String, // e.g., "July 2025"
    required: true,
  },
  isPaid: {
    type: Boolean,
    required: true,
  },
  paidOn: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Fee", feeSchema);