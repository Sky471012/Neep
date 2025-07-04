const mongoose = require("mongoose");

const { Schema } = mongoose;

const attendanceSchema = new Schema({
  _id: ObjectId,
  studentId: {
    type: ObjectId,
    ref: "students",
    required: true,
  },
  batchId: {
    type: ObjectId,
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
    type: ObjectId,
    ref: "admins_teachers",
    required: true,
  },
});

module.exports = mongoose.model("Attendance", attendanceSchema);
