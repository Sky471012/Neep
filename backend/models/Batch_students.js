const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const batch_studentSchema = new Schema({
  batchId: {
    type: Types.ObjectId,
    ref: "batches",
    required: true,
  },
  studentId: {
    type: Types.ObjectId,
    ref: "students",
    required: true,
  },
});

module.exports = mongoose.model("batch_student", batch_studentSchema);
