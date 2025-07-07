const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const FeeStatus = require('../models/Fee');
const Batches = require('../models/Batch_students');

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

exports.getbatches = async (req, res) => {
  try {
    const status = await Batches.find({ studentId: req.user.id });
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};