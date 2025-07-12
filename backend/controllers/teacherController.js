const Attendance = require("../models/Attendance");
const Batches = require("../models/Batch_teachers");
const BatchStudent = require("../models/Batch_students");
const Student = require("../models/Student");
const Timetable = require("../models/TimeTable");
const Test = require('../models/Test');


exports.getBatches = async (req, res) => {
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

exports.getTimetable = async (req, res) => {
  try {
    const { batchId } = req.params;

    const timetable = await Timetable.find({ batchId });

    res.json({ timetable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendance = await Attendance.find({ studentId });

    res.json({ attendance });
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

exports.addTest = async (req, res) => {
  const { studentId, batchId, name, maxMarks, marksScored, date } = req.body;

  try {
    const updatedTest = await Test.findOneAndUpdate(
      {
        studentId,
        batchId,
        name,
        date, // match these four fields for uniqueness
      },
      {
        $set: {
          maxMarks,
          marksScored,
        },
      },
      {
        new: true,          // return the updated document
        upsert: true,       // create if not found
        setDefaultsOnInsert: true,
      }
    );

    res.status(201).json({
      message: "Test added or updated successfully",
      test: updatedTest,
    });
  } catch (err) {
    console.error("Error adding/updating test:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getTest = async (req, res) => {
  try {
    const { batchId } = req.params;

    const test = await Test.find({ batchId });

    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};