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
    default: Date.now,
    required: true,
    // TTL index: auto-delete 24 hours after creation
    expires: 60 * 60 * 24, // seconds = 24 hours
  },
});

module.exports = model("BirthdayWish", birthdayWishSchema);