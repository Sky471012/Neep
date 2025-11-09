const mongoose = require("mongoose");
const { Schema } = mongoose;

const EnquirySchema = new Schema({
  studentName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  enquiryDate: {
    type: String,
    required: true,
  },
  followupDate: {
    type: String,
    required: true,
  },
  classSubject: {
    type: String,
    required: true,
  },
  followupType: {
    type: String,
    enum: ["demo", "call"],
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ["lost", "converted"],
    default: null,
  },
}, { timestamps: true });

EnquirySchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });


module.exports = mongoose.model("Enquiry", EnquirySchema);
