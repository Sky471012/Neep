const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const batchSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  class: {
    type: String,
    enum: ["Kids", "English Spoken", "9", "10", "11", "12", "Entrance Exams", "Graduation"],
    required: true,
  },
  startDate: {
    type: String,
    required: true
  },
  archive: {
    type: Boolean,
    default: false
  },
});

module.exports = model("Batch", batchSchema);
