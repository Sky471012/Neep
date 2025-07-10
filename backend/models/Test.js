const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const testSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  maxMarks: {
    type: Number,
    required: true,
  },
  marksScored: {
    type: Number,
    required: true,
  },
  studentId: {
    type: Types.ObjectId,
    ref: "Student",
    required: true,
  },
  batchId: {
    type: Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
});

module.exports = model("Test", testSchema);
