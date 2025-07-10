const Student = require("../models/Student");
const AdminTeacher = require("../models/Admins_teachers");
const OtpLog = require("../models/Otp");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail"); // Custom mailer util

exports.loginStudent = async (req, res) => {
  const { phone, dob } = req.body;

  try {
    const student = await Student.findOne({ phone, dob });

    if (!student)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: student._id, role: "student" },
      process.env.JWT_SECRET
    );
    res.json({
      success: true,
      authToken: token,
      student: {
        id: student.id,
        name: student.name,
        phone: student.phone,
        dob: student.dob,
        address: student.address,
        class: student.class,
        fee: student.fee,
        dateOfJoining: student.dateOfJoining
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await AdminTeacher.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OtpLog.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    await sendMail(email, "Your OTP", `Your OTP is: ${otp}`);
    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const log = await OtpLog.findOne({
      email,
      otp,
      expiresAt: { $gt: new Date() }
    });

    if (!log) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    const user = await AdminTeacher.findOne({ email });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
    );

    await OtpLog.deleteOne({ _id: log._id }); // Auto delete OTP after use
    res.json({
      success: true,
      authToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};