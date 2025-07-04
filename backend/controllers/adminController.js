const Batch = require('../models/Batch');
const BatchStudent = require('../models/Batch_students');
const BatchTeacher = require('../models/Batch_teachers');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const FeeStatus = require('../models/Fee');

exports.createBatch = async (req, res) => {
  try {
    const batch = await Batch.create({ name: req.body.name });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStudentToBatch = async (req, res) => {
  try {
    await BatchStudent.create({ batchId: req.params.batchId, studentId: req.body.studentId });
    res.json({ message: 'Student added to batch' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStudentFromBatch = async (req, res) => {
  try {
    await BatchStudent.findOneAndDelete({ batchId: req.params.batchId, studentId: req.params.studentId });
    res.json({ message: 'Student removed from batch' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { studentId, batchId, date, status } = req.body;
  try {
    const record = await Attendance.findOneAndUpdate(
      { studentId, date },
      { studentId, batchId, date, status, markedBy: req.user.id },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateFeeStatus = async (req, res) => {
  const { studentId, month, isPaid } = req.body;
  try {
    const fee = await FeeStatus.findOneAndUpdate(
      { studentId, month },
      { studentId, month, isPaid, paidOn: isPaid ? new Date() : null },
      { upsert: true, new: true }
    );
    res.json(fee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};