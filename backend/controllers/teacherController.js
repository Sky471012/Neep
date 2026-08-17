const mongoose = require("mongoose");
const AttendanceModel = require("../models/Attendance");
const AttendanceTeacherModel = require("../models/Attendance_Teacher");
const BatchesTeacherModel = require("../models/Batch_teachers");
const BatchStudentModel = require("../models/Batch_students");
const BatchModel = require("../models/Batch");
const StudentModel = require("../models/Student");
const TimetableModel = require("../models/TimeTable");
const TestModel = require("../models/Test");

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

exports.getBatches = async (req, res) => {
  try {
    const BatchesTeacher = req.db.model(
      "batch_teacher",
      BatchesTeacherModel.schema
    );
    const Batch = req.db.model("Batch", BatchModel.schema);

    // Step 1: Get all teacher's batch mappings
    const teacherBatches = await BatchesTeacher.find({
      teacherId: req.user.id,
    });

    // Step 2: Extract batchIds from those mappings
    const batchIds = teacherBatches.map((bt) => bt.batchId);

    // Step 3: Get only unarchived batches from Batch collection
    const unarchivedBatches = await Batch.find({
      _id: { $in: batchIds },
      archive: false,
    });

    const unarchivedBatchIds = unarchivedBatches.map((b) => b._id.toString());

    // Step 4: Filter teacherBatches where batchId is in unarchivedBatchIds
    const filteredTeacherBatches = teacherBatches.filter((tb) =>
      unarchivedBatchIds.includes(tb.batchId.toString())
    );

    res.json(filteredTeacherBatches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBatchStudents = async (req, res) => {
  try {
    const { batchId } = req.params;
    const BatchStudent = req.db.model(
      "batch_student",
      BatchStudentModel.schema
    );
    const Student = req.db.model("Student", StudentModel.schema);

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
    const Timetable = req.db.model("Timetable", TimetableModel.schema);

    const timetable = await Timetable.find({ batchId });

    const sortedTimetable = timetable.map((entry) => {
      const sortedClassTimings = [...entry.classTimings].sort((a, b) => {
        const parseTime = (timeStr) =>
          new Date(`1970-01-01T${convertTo24Hour(timeStr)}:00`);
        return parseTime(a.startTime) - parseTime(b.startTime);
      });

      return {
        _id: entry._id,
        weekday: entry.weekday,
        batchId: entry.batchId,
        classTimings: sortedClassTimings,
        __v: entry.__v,
      };
    });

    res.json({ timetable: sortedTimetable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const AttendanceTeacher = req.db.model(
      "Attendance_Teacher",
      AttendanceTeacherModel.schema
    );
    const records = await AttendanceTeacher.find({ teacherId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const Attendance = req.db.model("Attendance", AttendanceModel.schema);

    const attendance = await Attendance.find({ studentId });

    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { studentId, batchId, date, status } = req.body;
  try {
    const Attendance = req.db.model("Attendance", AttendanceModel.schema);

    const record = await Attendance.findOneAndUpdate(
      { studentId, batchId, date },
      { studentId, batchId, date, status, markedBy: req.user.id },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeAttendance = async (req, res) => {
  const { batchId, date } = req.body;
  try {
    const Attendance = req.db.model("Attendance", AttendanceModel.schema);

    const d = new Date(date);
    const start = new Date(d.getTime() - 12 * 60 * 60 * 1000);
    const end = new Date(d.getTime() + 12 * 60 * 60 * 1000);

    const result = await Attendance.deleteMany({
      batchId,
      date: { $gte: start, $lte: end },
    });

    res.json({ message: "Attendance removed", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addTest = async (req, res) => {
  const {
    studentId,
    batchId,
    name,
    maxMarks,
    marksScored,
    date,
    absent: absentFromClient,
  } = req.body;

  try {
    const Test = req.db.model("Test", TestModel.schema);

    // Check if test already exists
    const existingTest = await Test.findOne({ studentId, batchId, name, date });

    if (existingTest) {
      return res.status(200).json({
        message: "Test already exists. No changes made.",
        test: existingTest,
      });
    }

    const inferredAbsent =
      marksScored === null || marksScored === undefined || marksScored === "";
    const absent =
      typeof absentFromClient === "boolean" ? absentFromClient : inferredAbsent;

    // Create new test
    const newTest = new Test({
      studentId,
      batchId,
      name,
      maxMarks,
      marksScored: absent ? 0 : Number(marksScored),
      absent,
      date,
    });

    await newTest.save();

    res.status(201).json({
      message: "Test added successfully",
      test: newTest,
    });
  } catch (err) {
    console.error("Error adding test:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTest = async (req, res) => {
  try {
    const { batchId } = req.params;
    const Test = req.db.model("Test", TestModel.schema);

    const test = await Test.find({ batchId });

    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTodaysClassesForTeacher = async (req, res) => {
  try {
    const BatchesTeacher = req.db.model(
      "batch_teacher",
      BatchesTeacherModel.schema
    );
    const Batch = req.db.model("Batch", BatchModel.schema);
    const Timetable = req.db.model("Timetable", TimetableModel.schema);

    const teacherId = req.user.id;
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // Get all batches this teacher is assigned to
    const assigned = await BatchesTeacher.find({ teacherId });
    const assignedBatchIds = assigned.map((b) => b.batchId);

    if (assignedBatchIds.length === 0) {
      return res.json({ message: "No assigned batches", classes: [] });
    }

    // Get only non-archived batch IDs
    const activeBatches = await Batch.find({
      _id: { $in: assignedBatchIds },
      archive: false,
    });

    const activeBatchIds = activeBatches.map((b) => b._id);

    if (activeBatchIds.length === 0) {
      return res.json({
        message: "All assigned batches are archived",
        classes: [],
      });
    }

    // Find today's classes for active batches
    const classes = await Timetable.find({
      weekday: today,
      batchId: { $in: activeBatchIds },
    }).populate("batchId", "name class code");

    const formatted = classes.map((cls) => {
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
          class: cls.batchId.class,
          code: cls.batchId.code,
        },
        classTimings: sortedTimings,
      };
    });

    // 🧠 Sort all classes by earliest startTime in classTimings
    formatted.sort((a, b) => {
      const parseTime = (timeStr) =>
        new Date(`1970-01-01T${convertTo24Hour(timeStr)}:00`);
      return (
        parseTime(a.classTimings[0]?.startTime) -
        parseTime(b.classTimings[0]?.startTime)
      );
    });

    res.json({ today, classes: formatted });
  } catch (err) {
    console.error("Teacher timetable error:", err);
    res.status(500).json({ message: "Failed to load teacher's timetable" });
  }
};

exports.editMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const { marksScored } = req.body; // may be "" (mark absent) or a number-like string

    const Test = req.db.model("Test", TestModel.schema);

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // If empty or null -> Absent
    if (
      marksScored === "" ||
      marksScored === null ||
      typeof marksScored === "undefined"
    ) {
      test.absent = true;
      test.marksScored = null; // safe even if previously set
    } else {
      // Non-empty -> must be a number within [0, maxMarks]
      const n = Number(marksScored);
      if (Number.isNaN(n)) {
        return res
          .status(400)
          .json({
            message: "marksScored must be a number or empty to mark absent",
          });
      }
      if (n < 0 || n > test.maxMarks) {
        return res
          .status(400)
          .json({
            message: `marksScored must be between 0 and ${test.maxMarks}`,
          });
      }
      test.absent = false;
      test.marksScored = n;
    }

    await test.save();
    return res.json({ test });
  } catch (err) {
    console.error("Update marks error:", err);
    return res.status(500).json({ message: "Failed to update marks" });
  }
};

exports.editTestGroup = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { oldName, oldDate, name, date, maxMarks } = req.body;

    if (!batchId || !oldName || !oldDate || !name || !date || maxMarks === undefined) {
      return res.status(400).json({ message: "Batch, test name, date, and max marks are required" });
    }

    const trimmedOldName = String(oldName).trim();
    const trimmedOldDate = String(oldDate).trim();
    const trimmedName = String(name).trim();
    const trimmedDate = String(date).trim();
    const numericMaxMarks = Number(maxMarks);

    if (!trimmedOldName || !trimmedOldDate || !trimmedName || !trimmedDate) {
      return res.status(400).json({ message: "Batch, test name, date, and max marks are required" });
    }

    if (Number.isNaN(numericMaxMarks) || numericMaxMarks <= 0) {
      return res.status(400).json({ message: "Max marks must be a positive number" });
    }

    const testDateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!testDateRegex.test(trimmedDate)) {
      return res.status(400).json({ message: "Date must be in DD-MM-YYYY format" });
    }

    const Test = req.db.model("Test", TestModel.schema);

    const existingGroup = await Test.findOne({
      batchId,
      name: trimmedName,
      date: trimmedDate,
    });

    if (existingGroup && (trimmedName !== trimmedOldName || trimmedDate !== trimmedOldDate)) {
      return res.status(409).json({ message: "A test with the same name and date already exists for this batch" });
    }

    const currentGroup = await Test.find({
      batchId,
      name: trimmedOldName,
      date: trimmedOldDate,
    });

    if (!currentGroup.length) {
      return res.status(404).json({ message: "Test group not found" });
    }

    const invalidMark = currentGroup.find(
      (test) => !test.absent && test.marksScored !== null && Number(test.marksScored) > numericMaxMarks
    );

    if (invalidMark) {
      return res.status(400).json({
        message: "Max marks cannot be less than an already saved score in this test group",
      });
    }

    await Test.updateMany(
      {
        batchId,
        name: trimmedOldName,
        date: trimmedOldDate,
      },
      {
        $set: {
          name: trimmedName,
          date: trimmedDate,
          maxMarks: numericMaxMarks,
        },
      }
    );

    return res.json({
      message: "Test group updated successfully",
      testGroup: {
        batchId,
        name: trimmedName,
        date: trimmedDate,
        maxMarks: numericMaxMarks,
      },
    });
  } catch (err) {
    console.error("Edit test group error:", err);
    return res.status(500).json({ message: "Failed to update test group" });
  }
};

exports.deleteTest = async (req, res) => {
  try {
    const { batchId, name, date } = req.body;
    const Test = req.db.model("Test", TestModel.schema);
    if (!batchId || !name || !date) {
      return res
        .status(400)
        .json({
          message: "Provide testId OR batchId, name and date to delete tests",
        });
    }

    const docs = await Test.find({ batchId, name, date });
    if (!docs || docs.length === 0) {
      return res
        .status(404)
        .json({ message: "No tests found for the specified batch/name/date" });
    }

    const del = await Test.deleteMany({ batchId, name, date });
    return res.json({
      message: "Tests deleted successfully",
      deletedCount: del.deletedCount,
      deletedTests: docs,
    });
  } catch (err) {
    console.error("Delete test error:", err);
    res.status(500).json({ message: "Failed to delete test" });
  }
};