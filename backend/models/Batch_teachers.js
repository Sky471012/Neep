const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const batch_teacherSchema = new Schema({
  batchId: {
    type: Types.ObjectId,
    ref: "batches",
    required: true,
  },
  teacherId: {
    type: Types.ObjectId,
    ref: "admins_teachers",
    required: true,
  },
});

module.exports = mongoose.model("batch_teacher", batch_teacherSchema);
