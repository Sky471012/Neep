const Teacher = require("../models/Admins_teachers");
const Attendance = require("../models/Attendance");
const Batches = require("../models/Batch_teachers");
const BatchStudent = require("../models/Batch_students");
const Student = require("../models/Student");

exports.getTeacher = async (req, res) => {
  try {
    const credentials = await Teacher.findById(req.user.id);
    res.json(credentials);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getbatches = async (req, res) => {
  try {
    const batches = await Batches.find({ teacherId: req.user.id });
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;

    // Step 1: Get all studentIds in that batch
    const batchLinks = await BatchStudent.find({ batchId });

    const studentIds = batchLinks.map((bs) => bs.studentId);

    // Step 2: Fetch student details
    const students = await Student.find({ _id: { $in: studentIds } }).select(
      "name email phone dob"
    );

    res.json({ students });
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
