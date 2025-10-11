const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const birthdayWishSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  wishedOn: {
    type: String,
    required: true,
  },
});

module.exports = model("BirthdayWish", birthdayWishSchema);
