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
    required: false,
    default: null,
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
  absent: {
    type: Boolean,
    default: false,
  },
});

testSchema.index({ studentId: 1 });
testSchema.index({ batchId: 1, studentId: 1 });

module.exports = model("Test", testSchema);