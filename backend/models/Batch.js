const mongoose = require("mongoose");

const { Schema, model, Types } = mongoose;

const batchSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Batch", batchSchema);
