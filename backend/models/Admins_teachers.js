const mongoose = require("mongoose");

const { Schema } = mongoose;

const admin_teacherSchema = new Schema({
  _id: ObjectId,
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
