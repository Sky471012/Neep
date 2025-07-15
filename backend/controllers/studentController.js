const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Installment = require('../models/Installment');
const Batches = require('../models/Batch_students');
const Test = require('../models/Test');
const Timetable = require('../models/TimeTable');

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

exports.getTimetable = async (req, res) => {
  const {batchId} = req.body;
  try {
    const timetable = await Timetable.find({ batchId });
    res.json(timetable);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeStatus = async (req, res) => {
  try {
    const studentId = req.user.id;

    console.log("Getting fee for student:", studentId);
    const fee = await Fee.findOne({ studentId });

    if (!fee) return res.status(404).json({ message: "No fee record found" });

    const installments = await Installment.find({ studentId }).sort({ installmentNo: 1 });

    res.json({ fee, installments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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