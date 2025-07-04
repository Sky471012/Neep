const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const attendanceSchema = new Schema({
  studentId: {
    type: Types.ObjectId,
    ref: "students",
    required: true,
  },
  batchId: {
    type: Types.ObjectId,
    ref: "batches",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["present", "absent"],
    required: true,
  },
  markedBy: {
    type: Types.ObjectId,
    ref: "admins_teachers",
    required: true,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
