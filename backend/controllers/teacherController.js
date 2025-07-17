const Attendance = require("../models/Attendance");
const BatchesTeacher = require("../models/Batch_teachers");
const BatchStudent = require("../models/Batch_students");
const Batch = require("../models/Batch");
const Student = require("../models/Student");
const Timetable = require("../models/TimeTable");
const Test = require("../models/Test");

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'PM' && hours !== 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

exports.getBatches = async (req, res) => {
  try {
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

    const sortedTimetable = timetable.map((entry) => {
      const sortedClassTimings = [...entry.classTimings].sort((a, b) => {
        const parseTime = (timeStr) => new Date(`1970-01-01T${convertTo24Hour(timeStr)}:00`);
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
        new: true, // return the updated document
        upsert: true, // create if not found
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

exports.getTodaysClassesForTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Get all batches this teacher is assigned to
    const assigned = await BatchesTeacher.find({ teacherId });

    const batchIds = assigned.map((b) => b.batchId);

    if (batchIds.length === 0) {
      return res.json({ message: "No assigned batches", classes: [] });
    }

    // Find today's classes from those batches
    const classes = await Timetable.find({
      weekday: today,
      batchId: { $in: batchIds },
    }).populate("batchId", "name code");

    const formatted = classes.map((cls) => {
      // Sort classTimings by startTime (morning to evening)
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
        classTimings: sortedTimings,
      };
    });

    res.json({ today, classes: formatted });
  } catch (err) {
    console.error("Teacher timetable error:", err);
    res.status(500).json({ message: "Failed to load teacher's timetable" });
  }
};
