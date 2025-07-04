const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const FeeStatus = require('../models/Fee');

exports.getStudent = async (req, res) => {
  try {
    const credentials = await Student.findById( req.user.id );
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeStatus = async (req, res) => {
  try {
    const status = await FeeStatus.find({ studentId: req.user.id });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};