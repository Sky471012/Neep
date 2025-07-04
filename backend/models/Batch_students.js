const mongoose = require("mongoose");

const { Schema } = mongoose;

const batch_studentSchema = new Schema({
  _id: ObjectId,
  batchId: {
    type: ObjectId,
    ref: "batches",
    required: true,
  },
  studentId: {
    type: ObjectId,
    ref: "students",
    required: true,
  },
});

module.exports = mongoose.model("batch_student", batch_studentSchema);
