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
