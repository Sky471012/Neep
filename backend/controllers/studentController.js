const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const FeeStatus = require('../models/Fee');
const Batches = require('../models/Batch_students');
const Test = require('../models/Test');

exports.getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ studentId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const tests = await Test.find({ studentId: req.user.id });
    res.json(tests);
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
    const batches = await Batches.find({ studentId: req.user.id });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};