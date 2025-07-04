const mongoose = require("mongoose");

const { Schema } = mongoose;

const batch_teacherSchema = new Schema({
  _id: ObjectId,
  batchId: {
    type: ObjectId,
    ref: "batches",
    required: true,
  },
  teacherId: {
    type: ObjectId,
    ref: "admins_teachers",
    required: true,
  },
});

module.exports = mongoose.model("batch_teacher", batch_teacherSchema);
