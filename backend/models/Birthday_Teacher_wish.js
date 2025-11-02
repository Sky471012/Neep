const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const birthdayTeacherWishSchema = new Schema({
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: "Admin_Teacher",
    required: true,
  },
  wishedOn: {
    type: Date,
    default: Date.now,       // store as JS Date
    required: true,
    expires: 60 * 60 * 24,  // auto-delete after 24 hours
  },
});

module.exports = model("TeacherBirthdayWish", birthdayTeacherWishSchema);