const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const attendanceTeacherSchema = new Schema({
  teacherId: {
    type: Types.ObjectId,
    ref: "admins_teachers",
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

module.exports = mongoose.model("Attendance_Teacher", attendanceTeacherSchema);
