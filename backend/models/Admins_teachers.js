const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const admin_teacherSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "teacher"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("admin_teacher", admin_teacherSchema);
