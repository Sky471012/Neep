const mongoose = require("mongoose");

const { Schema } = mongoose;

const batchSchema = new Schema({
  _id: ObjectId,
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
