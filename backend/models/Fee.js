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
  feePaidDate: {
    type: String,
    required: true,
    default: function () {
      // Get today's date in DD-MM-YYYY format
      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    },
  },
});

module.exports = model("Fee", feeSchema);
