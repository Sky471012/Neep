const mongoose = require("mongoose");
const { Schema } = mongoose;

const PopupSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Popup", PopupSchema);