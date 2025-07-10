const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const timeTableSchema = new Schema({
  weekday: {
    type: String,
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    required: true,
  },
  classTimings: [
    {
      startTime: String, // e.g., "10:00 AM"
      endTime: String,   // e.g., "11:00 AM"
    },
  ],
  batchId: {
    type: Types.ObjectId,
    ref: "Batch",
    required: true,
  },
});

module.exports = model("TimeTable", timeTableSchema);