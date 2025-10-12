const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const birthdayWishSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  wishedOn: {
    type: Date,
    default: Date.now,       // store as JS Date
    required: true,
    expires: 60 * 60 * 24,  // auto-delete after 24 hours
  },
});

module.exports = model("BirthdayWish", birthdayWishSchema);