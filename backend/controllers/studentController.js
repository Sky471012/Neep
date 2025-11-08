const mongoose = require("mongoose");
const StudentModel = require("../models/Student");
const AttendanceModel = require("../models/Attendance");
const TestModel = require("../models/Test");
const TimetableModel = require("../models/TimeTable");
const FeeModel = require("../models/Fee");
const InstallmentModel = require("../models/Installment");
const BatchModel = require("../models/Batch");
const BatchesStudentModel = require("../models/Batch_students");

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

exports.getAttendance = async (req, res) => {
  try {
    const Attendance = req.db.model("Attendance", AttendanceModel.schema);
    const records = await Attendance.find({ studentId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const Test = req.db.model("Test", TestModel.schema);
    const tests = await Test.find({ studentId: req.user.id });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTimetable = async (req, res) => {
  const { batchId } = req.body;

  try {
    const Timetable = req.db.model("TimeTable", TimetableModel.schema);
    const timetable = await Timetable.find({ batchId }).populate("batchId");

    const formatted = timetable.map((cls) => {
      // Sort classTimings by startTime
      const sortedTimings = [...cls.classTimings].sort((a, b) => {
        const parseTime = (timeStr) =>
          new Date(`1970-01-01T${convertTo24Hour(timeStr)}:00`);
        return parseTime(a.startTime) - parseTime(b.startTime);
      });

      return {
        weekday: cls.weekday,
        batch: {
          id: cls.batchId._id,
          name: cls.batchId.name,
          code: cls.batchId.code,
        },
        timetable: sortedTimings,
      };
    });

    res.json(formatted); // Corrected
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeeStatus = async (req, res) => {
  try {
    const Fee = req.db.model("Fee", FeeModel.schema);
    const Installment = req.db.model("Installment", InstallmentModel.schema);

    const studentId = req.user.id;

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
    const BatchesStudent = req.db.model("batch_student", BatchesStudentModel.schema);
    const Batch = req.db.model("Batch", BatchModel.schema);
    // Step 1: Get all batch mappings for the student
    const studentBatches = await BatchesStudent.find({ studentId: req.user.id });

    const batchIds = studentBatches.map((bs) => bs.batchId);

    // Step 2: Get only unarchived batches
    const unarchivedBatches = await Batch.find({
      _id: { $in: batchIds },
      archive: false
    });

    const unarchivedBatchIds = unarchivedBatches.map((b) => b._id.toString());

    // Step 3: Filter studentBatches to include only unarchived ones
    const filteredStudentBatches = studentBatches.filter((sb) =>
      unarchivedBatchIds.includes(sb.batchId.toString())
    );

    res.json(filteredStudentBatches);
  } catch (err) {
    console.error("Error fetching student batches:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const Student = req.db.model("Student", StudentModel.schema);

    const student = await Student.findOne({ phone: req.user.phone, dob: req.user.dob });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        phone: student.phone,
        dob: student.dob,
        address: student.address,
        class: student.class,
        fee: student.fee,
        dateOfJoining: student.dateOfJoining,
        guardianName: student.guardianName || "N/A",
        schoolType: student.schoolType || "N/A",
      },
    });
  } catch (err) {
    console.error("Error fetching student profile:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};