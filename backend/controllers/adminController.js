const BatchModel = require("../models/Batch");
const BatchStudentModel = require("../models/Batch_students");
const AttendanceModel = require("../models/Attendance");
const AttendanceTeacherModel = require("../models/Attendance_Teacher");
const TimetableModel = require("../models/TimeTable");
const TestModel = require("../models/Test");
const FeeModel = require("../models/Fee");
const InstallmentModel = require("../models/Installment");
const StudentModel = require("../models/Student");
const TeacherModel = require("../models/Admins_teachers");
const BatchTeacherModel = require("../models/Batch_teachers");
const BirthdayWishModel = require("../models/Birthday_wish");
const TeacherBirthdayWishModel = require("../models/Birthday_Teacher_wish");
const EnquiryModel = require("../models/Enquiry");
const XLSX = require("xlsx");
const { DateTime } = require("luxon");
const mongoose = require("mongoose");

function getModels(req) {
  return {
    Batch: req.db.model("Batch", BatchModel.schema),
    BatchStudent: req.db.model("batch_student", BatchStudentModel.schema),
    Attendance: req.db.model("Attendance", AttendanceModel.schema),
    AttendanceTeacher: req.db.model(
      "Attendance_Teacher",
      AttendanceTeacherModel.schema
    ),
    Timetable: req.db.model("Timetable", TimetableModel.schema),
    Test: req.db.model("Test", TestModel.schema),
    Fee: req.db.model("Fee", FeeModel.schema),
    Installment: req.db.model("Installment", InstallmentModel.schema),
    Student: req.db.model("Student", StudentModel.schema),
    Teacher: req.db.model("AdminTeacher", TeacherModel.schema),
    BatchTeacher: req.db.model("batch_teacher", BatchTeacherModel.schema),
    BirthdayWish: req.db.model("BirthdayWish", BirthdayWishModel.schema),
    TeacherBirthdayWish: req.db.model(
      "TeacherBirthdayWish",
      TeacherBirthdayWishModel.schema
    ),
    Enquiry: req.db.model("Enquiry", EnquiryModel.schema),
  };
}

function convertTo24Hour(time12h) {
  const [time, modifier] = time12h.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// Batch Management
exports.getBatches = async (req, res) => {
  try {
    const { Batch } = getModels(req);
    const batches = await Batch.find({ archive: false }); // Only unarchived batches
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArchivedBatches = async (req, res) => {
  try {
    const { Batch } = getModels(req);
    const archivedBatches = await Batch.find({ archive: true }); // Only archived batches
    res.json(archivedBatches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBatch = async (req, res) => {
  try {
    const { Batch } = getModels(req);
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBatchStudents = async (req, res) => {
  try {
    const { BatchStudent, Student } = getModels(req);
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

exports.getBatchTimetable = async (req, res) => {
  try {
    const { Timetable } = getModels(req);
    const { batchId } = req.params;

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

exports.getBatchTeacher = async (req, res) => {
  try {
    const { BatchTeacher, Teacher } = getModels(req);
    const { batchId } = req.params;

    const batchLink = await BatchTeacher.find({ batchId });

    const teacherIds = batchLink.map((bs) => bs.teacherId);

    const teacher = await Teacher.find({ _id: { $in: teacherIds } }).select(
      "name email phone dob"
    );

    res.json({ teacher });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsAttendance = async (req, res) => {
  try {
    const { Attendance } = getModels(req);
    const { studentId } = req.params;

    const attendance = await Attendance.find({ studentId });

    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentstests = async (req, res) => {
  try {
    const { Test } = getModels(req);
    const { studentId } = req.params;

    const tests = await Test.find({ studentId });

    res.json({ tests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  const { Attendance } = getModels(req);
  const { studentId, batchId, date, status } = req.body;
  try {
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
  const { Attendance } = getModels(req);
  const { batchId, date } = req.body;
  try {
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
  const { Test } = getModels(req);
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
    // Check if test already exists
    const existingTest = await Test.findOne({ studentId, batchId, name, date });

    if (existingTest) {
      return res.status(200).json({
        message: "Test already exists. No changes made.",
        test: existingTest,
      });
    }

    // infer absent if client didn't send a boolean
    const inferredAbsent =
      marksScored === null || marksScored === undefined || marksScored === "";
    const absent =
      typeof absentFromClient === "boolean" ? absentFromClient : inferredAbsent;

    const safeMarks = absent ? 0 : Number(marksScored);
    if (!absent && (Number.isNaN(safeMarks) || safeMarks < 0)) {
      return res.status(400).json({ error: "Invalid marksScored" });
    }

    // Create new test
    const newTest = new Test({
      studentId,
      batchId,
      name,
      maxMarks: Number(maxMarks),
      marksScored: safeMarks,
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

exports.createBatch = async (req, res) => {
  const { Batch } = getModels(req);
  try {
    const name = req.body.name?.trim();
    const startDate = req.body.startDate?.trim();
    let code = req.body.code?.trim();
    const batchClass = req.body.batchClass?.trim();

    if (!name || !startDate) {
      return res
        .status(400)
        .json({ message: "Name and startDate are required." });
    }

    const existingBatch = await Batch.findOne({ name, class: batchClass });

    if (existingBatch) {
      return res
        .status(400)
        .json({ message: "Batch with same name and class already exists." });
    }

    // Generate code if not provided
    if (!code) {
      code = `B-${Date.now().toString().slice(-6)}`;
    }

    const batch = await Batch.create({
      name,
      code,
      class: batchClass,
      startDate,
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
  const { Timetable } = getModels(req);
  try {
    const { batchId } = req.params;
    const { timetable } = req.body;

    // Step 1: Delete all existing entries for this batch
    await Timetable.deleteMany({ batchId });

    // Step 2: Filter out any entries with an empty classTimings array
    const filteredTimetable = timetable
      .filter((entry) => entry.classTimings && entry.classTimings.length > 0)
      .map((entry) => ({ ...entry, batchId }));

    // Step 3: Insert only non-empty entries
    if (filteredTimetable.length > 0) {
      await Timetable.insertMany(filteredTimetable);
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStudent = async (req, res) => {
  const { BatchStudent, Attendance, Test } = getModels(req);
  const { batchId, studentId } = req.body;

  if (!batchId || !studentId) {
    return res.status(400).json({ error: "Missing batchId or studentId" });
  }

  try {
    // Delete from BatchStudent
    await BatchStudent.findOneAndDelete({ batchId, studentId });

    // Delete from Attendance
    await Attendance.deleteMany({ batchId, studentId });

    // Delete from Test
    await Test.deleteMany({ batchId, studentId });

    res.json({ message: "Student removed." });
  } catch (err) {
    console.error("Remove student error:", err); // 👈 helpful for debugging
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBatch = async (req, res) => {
  const { Batch, BatchTeacher, BatchStudent, Attendance, Timetable, Test } =
    getModels(req);
  try {
    const batchId = req.params.batchId;

    // delete from Batch
    await Batch.findOneAndDelete({
      _id: batchId,
    });

    // delete from Batch_teachers
    await BatchTeacher.findOneAndDelete({
      batchId: batchId,
    });

    // delete from Batch_students
    await BatchStudent.deleteMany({
      batchId: batchId,
    });

    // delete from Attendance
    await Attendance.deleteMany({
      batchId: batchId,
    });

    // delete from Timetable
    await Timetable.deleteMany({
      batchId: batchId,
    });

    // delete from Test
    await Test.deleteMany({
      batchId: batchId,
    });

    res.json({ message: "Batch removed from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignTeacher = async (req, res) => {
  const { Batch, Teacher, BatchTeacher } = getModels(req);
  try {
    const { batchId, teacherId } = req.params;

    // Check if batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Assign or update the teacher for the batch
    await BatchTeacher.findOneAndUpdate(
      { batchId }, // Filter: only this batch
      {
        teacherId,
        batchName: batch.name,
      },
      {
        new: true,
        upsert: true, // create if not exists
        setDefaultsOnInsert: true,
      }
    );

    const teacherUpdated = await Teacher.findById(teacherId);
    res.status(200).json({ teacherUpdated });
  } catch (error) {
    console.error("Error assigning teacher to batch:", error);

    // Handle MongoDB duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "This batch already has a teacher assigned." });
    }

    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.addStudentsToBatch = async (req, res) => {
  const { Batch, BatchStudent, Student } = getModels(req);
  try {
    const { batchId, studentIds } = req.body;

    if (!Array.isArray(studentIds)) {
      return res.status(400).json({ message: "Invalid studentIds array." });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    // Step 1: Get already added student IDs for this batch
    const existingLinks = await BatchStudent.find({ batchId });
    const existingStudentIds = existingLinks.map((link) =>
      link.studentId.toString()
    );

    // Step 2: Filter new studentIds
    const newStudentIds = studentIds.filter(
      (id) => !existingStudentIds.includes(id)
    );

    if (newStudentIds.length === 0) {
      return res.status(400).json({ message: "No new students to add." });
    }

    // Step 3: Create new batch-student links
    const newLinks = newStudentIds.map((studentId) => ({
      batchId,
      batchName: batch.name,
      studentId,
    }));

    await BatchStudent.insertMany(newLinks);

    // Step 4: Fetch and return added student details
    const addedStudents = await Student.find({ _id: { $in: newStudentIds } });

    return res.status(200).json({ message: "Students added", addedStudents });
  } catch (err) {
    console.error("Add Students Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.addStudentByCreating = async (req, res) => {
  const { Student, BatchStudent } = getModels(req);
  const { batchId } = req.params;

  try {
    const existingStudent = await Student.findOne({
      phone: req.body.phone.trim(),
      dob: req.body.dob.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with same phone and DOB already exists.",
      });
    }

    const student = await Student.create({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      dob: req.body.dob.trim(), // must be DD-MM-YYYY
      address: req.body.address.trim(),
      class: req.body.class.trim(),
      dateOfJoining: req.body.dateOfJoining.trim(), // must be DD-MM-YYYY
      guardianName: req.body.guardianName?.trim() || "", // optional
      guardianPhone: req.body.guardianPhone?.trim() || "", // optional
      schoolType: req.body.schoolType || "NA",
    });

    const batchStudent = await BatchStudent.create({
      batchId,
      batchName: req.body.batchName,
      studentId: student._id,
    });

    res
      .status(201)
      .json({ message: "Student created and added to batch.", student });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.toggleArchiveStatus = async (req, res) => {
  const { Batch } = getModels(req);
  try {
    const batchId = req.params.batchId;
    const { archive } = req.body;

    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      { archive },
      { new: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ message: "Batch not found" });
    }

    res.json(updatedBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editBatch = async (req, res) => {
  const { Batch, BatchTeacher, BatchStudent } = getModels(req);
  try {
    const { batchId } = req.params;
    const { name, class: batchClass, startDate } = req.body;

    // Validate required fields
    if (!name || !batchClass || !startDate) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate startDate format (DD-MM-YYYY)
    const startDateRegex =
      /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!startDateRegex.test(startDate)) {
      return res
        .status(400)
        .json({ error: "Start date must be in DD-MM-YYYY format" });
    }

    // Validate class enum
    const validClasses = [
      "Kids",
      "English Spoken",
      "9",
      "10",
      "11",
      "12",
      "Entrance Exams",
      "Graduation",
    ];
    if (!validClasses.includes(batchClass)) {
      return res.status(400).json({ error: "Invalid class selection" });
    }

    // Check if another batch exists with same name and class
    const existingBatch = await Batch.findOne({
      name: name.trim(),
      class: batchClass,
      _id: { $ne: batchId },
    });

    if (existingBatch) {
      return res.status(400).json({
        error: "Another batch with the same name and class already exists",
      });
    }

    // Update batch
    const updatedBatch = await Batch.findByIdAndUpdate(
      batchId,
      {
        name: name.trim(),
        class: batchClass,
        startDate: startDate.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedBatch) {
      return res.status(404).json({ error: "Batch not found" });
    }

    // Also update batchName in Batch_teachers and Batch_students
    await Promise.all([
      BatchTeacher.updateMany({ batchId }, { batchName: name.trim() }),
      BatchStudent.updateMany({ batchId }, { batchName: name.trim() }),
    ]);

    res.json(updatedBatch);
  } catch (error) {
    console.error("Error updating batch:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({ error: validationErrors.join(", ") });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTest = async (req, res) => {
  const { Test } = getModels(req);
  try {
    const { batchId } = req.params;

    const test = await Test.find({ batchId });

    res.json({ test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editMarks = async (req, res) => {
  const { Test } = getModels(req);
  try {
    const { testId } = req.params;
    const { marksScored } = req.body; // may be "" (mark absent) or a number-like string

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
        return res.status(400).json({
          message: "marksScored must be a number or empty to mark absent",
        });
      }
      if (n < 0 || n > test.maxMarks) {
        return res.status(400).json({
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
  const { Test } = getModels(req);

  try {
    const { batchId } = req.params;
    const { oldName, oldDate, name, date, maxMarks } = req.body;

    if (!batchId || !oldName || !oldDate || !name || !date || maxMarks === undefined) {
      return res.status(400).json({ message: "Batch, test name, date, and max marks are required" });
    }

    const trimmedOldName = oldName.trim();
    const trimmedOldDate = oldDate.trim();
    const trimmedName = name.trim();
    const trimmedDate = date.trim();
    const numericMaxMarks = Number(maxMarks);

    if (!trimmedOldName || !trimmedOldDate || !trimmedName || !trimmedDate) {
      return res.status(400).json({ message: "Batch, test name, date, and max marks are required" });
    }

    const testDateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!testDateRegex.test(trimmedDate)) {
      return res.status(400).json({ message: "Date must be in DD-MM-YYYY format" });
    }

    if (Number.isNaN(numericMaxMarks) || numericMaxMarks <= 0) {
      return res.status(400).json({ message: "Max marks must be a positive number" });
    }

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
      (test) => !test.absent && test.marksScored !== null && test.marksScored > numericMaxMarks
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

// Student Management
exports.getStudents = async (req, res) => {
  const { Student } = getModels(req);
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudent = async (req, res) => {
  const { Student } = getModels(req);
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentBatches = async (req, res) => {
  const { BatchStudent, Batch } = getModels(req);
  try {
    const { studentId } = req.params;

    // Step 1: Get all batchIds of that student
    const studentLinks = await BatchStudent.find({ studentId });

    const batchIds = studentLinks.map((sb) => sb.batchId);

    // Step 2: Fetch only unarchived batch details
    const batches = await Batch.find({
      _id: { $in: batchIds },
      archive: false,
    }).select("name");

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentFee = async (req, res) => {
  const { Fee } = getModels(req);
  try {
    const { studentId } = req.params;

    const fee = await Fee.find({ studentId });

    res.json({ fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentInstallments = async (req, res) => {
  const { Installment } = getModels(req);
  try {
    const { studentId } = req.params;

    const installments = await Installment.find({ studentId });

    res.json({ installments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentsAllTests = async (req, res) => {
  const { Test } = getModels(req);
  try {
    const { studentId } = req.params;

    const tests = await Test.find({ studentId }).populate({
      path: "batchId",
      select: "name", // only fetch the name field from Batch
    });

    // If you want a cleaner response without the nested batchId object:
    const formattedTests = tests.map((test) => ({
      _id: test._id,
      name: test.name,
      maxMarks: test.maxMarks,
      marksScored: test.marksScored,
      date: test.date,
      absent: test.absent,
      batchId: test.batchId?._id,
      batchName: test.batchId?.name || null,
    }));

    res.json({ tests: formattedTests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  const { Student } = getModels(req);
  try {
    const {
      name,
      phone,
      dob,
      address,
      class: studentClass,
      dateOfJoining,
      guardianName,
      guardianPhone,
      schoolType,
    } = req.body;

    // Check if student exists
    const existingStudent = await Student.findOne({
      phone: phone.trim(),
      dob: req.body.dob.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with same DOB and phone number already exists.",
      });
    }

    // Validate DOB format: DD-MM-YYYY
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({
        message: "Date of birth must be in DD-MM-YYYY format.",
      });
    }

    if (!dobRegex.test(dateOfJoining)) {
      return res.status(400).json({
        message: "Date of joining must be in DD-MM-YYYY format.",
      });
    }

    // Validate class enum
    const allowedClasses = [
      "Kids",
      "English Spoken",
      "9",
      "10",
      "11",
      "12",
      "Entrance Exams",
      "Graduation",
    ];
    if (!allowedClasses.includes(studentClass)) {
      return res.status(400).json({
        message: "Invalid class selected.",
      });
    }

    const student = await Student.create({
      name: name.trim(),
      phone: phone.trim(),
      dob: dob.trim(),
      address: address.trim(),
      class: studentClass,
      dateOfJoining: dateOfJoining.trim(),
      guardianName: guardianName ? guardianName.trim() : "",
      guardianPhone: guardianPhone ? guardianPhone.trim() : "",
      schoolType: schoolType || "NA",
    });

    res.status(200).json(student);
  } catch (err) {
    console.error("Create Student Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

exports.deleteStudent = async (req, res) => {
  const { Student, BatchStudent, Attendance, Fee, Installment } =
    getModels(req);
  try {
    const studentId = req.params.studentId;

    // delete from Student
    await Student.findOneAndDelete({
      _id: studentId,
    });

    // delete from Batch_students
    await BatchStudent.deleteMany({
      studentId: studentId,
    });

    // delete from Attendance
    await Attendance.deleteMany({
      studentId: studentId,
    });

    // delete from Fee
    await Fee.deleteMany({
      studentId: studentId,
    });

    // delete from Installment
    await Installment.deleteMany({
      studentId: studentId,
    });

    res.json({ message: "Student removed from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStudentToBatch = async (req, res) => {
  const { Batch, BatchStudent, Student } = getModels(req);
  try {
    const studentId = req.params.studentId;
    const batchId = req.params.batchId;

    // Check if the batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    // Check if the teacher exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Check if assignment already exists
    const existing = await BatchStudent.findOne({ batchId, studentId });
    if (existing) {
      return res.json({ message: "Already Exist in batch." });
    } else {
      // Create a new assignment
      await BatchStudent.create({
        batchId,
        batchName: batch.name,
        studentId,
      });
    }

    return res.json({ message: "Student assigned successfully." });
  } catch (error) {
    console.error("Error adding student:", error);
    return res
      .status(500)
      .json({ message: "Server error. Could not add student." });
  }
};

exports.updateFee = async (req, res) => {
  const { Fee } = getModels(req);
  const { studentId } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ message: "Amount is required" });
  }

  try {
    const feeRecord = await Fee.findOne({ studentId });

    if (!feeRecord) {
      return res.status(404).json({ message: "Fee record not found" });
    }

    feeRecord.totalAmount = amount;
    await feeRecord.save();

    res
      .status(200)
      .json({ message: "Fee updated successfully", fee: feeRecord });
  } catch (err) {
    console.error("Error updating fee:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addInstallment = async (req, res) => {
  const { Installment, Fee } = getModels(req);
  try {
    const { studentId, feeId, installmentNo, amount, dueDate } = req.body;

    const feeExists = await Fee.findById(feeId);
    if (!feeExists)
      return res.status(404).json({ message: "Fee record not found" });

    const newInstallment = new Installment({
      feeId,
      studentId,
      installmentNo,
      amount,
      dueDate,
    });

    await newInstallment.save();
    res
      .status(201)
      .json({ message: "Installment added", installment: newInstallment });
  } catch (err) {
    console.error("Add Installment Error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.removeInstallment = async (req, res) => {
  const { Installment } = getModels(req);
  try {
    const installmentId = req.params.installmentId;

    const installment = await Installment.findById(installmentId);
    if (!installment)
      return res.status(404).json({ message: "Installment not found" });

    if (installment.paidDate) {
      return res
        .status(400)
        .json({ message: "Cannot remove a paid installment" });
    }

    const { studentId, feeId, amount } = installment;

    // Get other unpaid installments excluding the one to delete
    const otherUnpaid = await Installment.find({
      studentId,
      feeId,
      _id: { $ne: installmentId },
      $or: [{ paidDate: { $exists: false } }, { paidDate: null }],
    }).sort({ dueDate: 1 }); // Sorting to maintain order

    if (otherUnpaid.length === 0) {
      return res.status(400).json({
        message: "No other unpaid installments to redistribute amount",
      });
    }

    // Redistribute amount equally
    const equalShare = Math.floor(amount / otherUnpaid.length);
    const remainder = amount % otherUnpaid.length;

    await Promise.all(
      otherUnpaid.map((inst, idx) =>
        Installment.findByIdAndUpdate(inst._id, {
          $inc: { amount: idx === 0 ? equalShare + remainder : equalShare },
        })
      )
    );

    // Delete the installment
    await Installment.findByIdAndDelete(installmentId);

    // Renumber all installments (both paid and unpaid)
    const all = await Installment.find({ studentId, feeId }).sort({
      dueDate: 1,
    });

    await Promise.all(
      all.map((inst, idx) =>
        Installment.findByIdAndUpdate(inst._id, {
          installmentNo: idx + 1,
        })
      )
    );

    res.json({
      message:
        "Installment removed, amount redistributed, and installments renumbered.",
    });
  } catch (err) {
    console.error("Error removing installment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.redistributeInstallment = async (req, res) => {
  const { Installment } = getModels(req);
  const installmentId = req.params.installmentId;
  const { amount } = req.body;

  try {
    const installment = await Installment.findById(installmentId);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }

    installment.amount = amount;
    await installment.save();

    return res.json({ updatedInstallment: installment });
  } catch (err) {
    console.error("Error updating installment:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.createFeeWithInstallments = async (req, res) => {
  const { Student, Fee, Installment } = getModels(req);
  try {
    const { studentId, amount, numberOfInstallments } = req.body;

    if (
      !studentId ||
      !amount ||
      !numberOfInstallments ||
      amount <= 0 ||
      numberOfInstallments <= 0
    ) {
      return res.status(400).json({ message: "Missing or invalid inputs." });
    }

    // ✅ Check if student exists and get their date of joining
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    let doj;
    if (
      typeof student.dateOfJoining === "string" &&
      student.dateOfJoining.includes("-")
    ) {
      const [day, month, year] = student.dateOfJoining.split("-").map(Number);
      doj = new Date(year, month - 1, day);
    } else {
      doj = new Date(student.dateOfJoining);
    }

    if (isNaN(doj)) {
      return res.status(400).json({ message: "Invalid date of joining." });
    }

    // ✅ Check if student already has a fee record
    const existing = await Fee.findOne({ studentId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Fee structure already exists for this student." });
    }

    // 1. Create Fee
    const newFee = new Fee({
      studentId,
      totalAmount: amount,
    });

    await newFee.save();

    // 2. Calculate amounts
    const equalAmount = Math.floor(amount / numberOfInstallments);
    const remainder = amount % numberOfInstallments;

    // 3. Create installments
    const installments = [];

    for (let i = 0; i < numberOfInstallments; i++) {
      const dueDate = new Date(doj); // start from date of joining
      dueDate.setMonth(doj.getMonth() + i); // add i months

      const inst = new Installment({
        studentId,
        feeId: newFee._id,
        installmentNo: i + 1,
        amount: i === 0 ? equalAmount + remainder : equalAmount,
        dueDate: dueDate,
        paidDate: null,
        method: null,
      });

      await inst.save();
      installments.push(inst);
    }

    return res.status(201).json({
      message: "Fee and installments created successfully",
      fee: newFee,
      installments,
    });
  } catch (err) {
    console.error("Error creating fee & installments:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  const { Fee, Installment } = getModels(req);
  try {
    const { studentId } = req.params;

    const fee = await Fee.findOne({ studentId });
    if (!fee) {
      return res.status(404).json({ message: "Fee record not found." });
    }

    // Delete all related installments
    await Installment.deleteMany({ feeId: fee._id });

    // Delete the fee record
    await Fee.deleteOne({ _id: fee._id });

    return res
      .status(200)
      .json({ message: "Fee and installments deleted successfully." });
  } catch (err) {
    console.error("Error deleting fee structure:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

exports.markInstallmentPaid = async (req, res) => {
  const { Installment } = getModels(req);
  const { id } = req.params;
  const { paidDate, method } = req.body;

  try {
    const installment = await Installment.findById(id);
    if (!installment) {
      return res.status(404).json({ message: "Installment not found" });
    }

    installment.paidDate = new Date(paidDate); // ✅ No custom parser
    installment.method = method;

    await installment.save();

    res.json({ message: "Installment marked as paid", installment });
  } catch (err) {
    console.error("Error in markInstallmentPaid:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateInstallment = async (req, res) => {
  const { Installment, Fee } = getModels(req);
  const session = await req.db.startSession();
  session.startTransaction();
  try {
    const { id } = req.params;
    const { amount, dueDate, paidDate, method } = req.body;

    // 1) Load existing installment (to compute delta)
    const existing = await Installment.findById(id).session(session);
    if (!existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Installment not found" });
    }

    // Build update object
    const updateFields = {};
    if (amount !== undefined) updateFields.amount = amount;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;

    if (paidDate === null || paidDate === "") {
      updateFields.paidDate = null;
      updateFields.method = null;
    } else if (paidDate !== undefined) {
      updateFields.paidDate = paidDate;
      if (method) updateFields.method = method;
    }

    // 2) Apply installment update
    const updated = await Installment.findByIdAndUpdate(id, updateFields, {
      new: true,
      session,
    });

    // 3) If amount changed, adjust Fee.totalAmount
    if (amount !== undefined) {
      const oldAmt = Number(existing.amount || 0);
      const newAmt = Number(updated.amount || 0);
      const delta = newAmt - oldAmt;

      await Fee.findOneAndUpdate(
        { studentId: updated.studentId },
        { $inc: { totalAmount: delta } },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      message: "Installment updated successfully",
      installment: updated,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error updating installment:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.addStudentToBatches = async (req, res) => {
  const { Batch, BatchStudent, Student } = getModels(req);
  try {
    const { batchIds, studentId } = req.body;

    if (!Array.isArray(batchIds)) {
      return res.status(400).json({ message: "Invalid batchIds array." });
    }

    // Validate student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    // Step 1: Get already added batch IDs
    const existingLinks = await BatchStudent.find({ studentId });
    const existingBatchIds = existingLinks.map((link) =>
      link.batchId.toString()
    );

    // Step 2: Filter out already-added batch IDs
    const newBatchIds = batchIds.filter((id) => !existingBatchIds.includes(id));

    if (newBatchIds.length === 0) {
      return res.status(400).json({ message: "No new batches to add." });
    }

    // Step 3: Fetch batch names for these newBatchIds
    const newBatches = await Batch.find({ _id: { $in: newBatchIds } });

    // Step 4: Create batch-student links
    const newLinks = newBatches.map((batch) => ({
      batchId: batch._id,
      batchName: batch.name,
      studentId: student._id,
    }));

    await BatchStudent.insertMany(newLinks);

    // Step 5: Return added batches
    return res.status(200).json({
      message: "Batches added successfully.",
      addedBatches: newBatches,
    });
  } catch (err) {
    console.error("Add Batches Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

exports.editStudent = async (req, res) => {
  const { Student } = getModels(req);
  try {
    const { studentId } = req.params;
    const {
      name,
      phone,
      dob,
      address,
      class: studentClass,
      dateOfJoining,
      guardianName,
      guardianPhone,
      schoolType,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !dob ||
      !address ||
      !studentClass ||
      !dateOfJoining
    ) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Validate DOB format (DD-MM-YYYY)
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!dobRegex.test(dob)) {
      return res.status(400).json({
        error: "Date of birth must be in DD-MM-YYYY format",
      });
    }

    // Validate class enum
    const validClasses = [
      "Kids",
      "English Spoken",
      "9",
      "10",
      "11",
      "12",
      "Entrance Exams",
      "Graduation",
    ];
    if (!validClasses.includes(studentClass)) {
      return res.status(400).json({
        error: "Invalid class selection",
      });
    }

    // Check if phone already exists for another student
    const existingStudent = await Student.findOne({
      phone: phone,
      name: name,
      _id: { $ne: studentId },
    });

    if (existingStudent) {
      return res.status(400).json({
        error: "Student with same DOB and phone number already exists",
      });
    }

    // Update student
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      {
        name: name.trim(),
        phone: phone.trim(),
        dob: dob.trim(),
        address: address.trim(),
        class: studentClass,
        dateOfJoining: dateOfJoining.trim(),
        guardianName: guardianName?.trim() || "",
        guardianPhone: guardianPhone?.trim() || "",
        schoolType: schoolType || "NA",
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        error: "Student not found",
      });
    }

    res.json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        error: validationErrors.join(", "),
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
};

// Teacher Management
exports.getTeachers = async (req, res) => {
  const { Teacher } = getModels(req);
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacher = async (req, res) => {
  const { Teacher } = getModels(req);
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherBatches = async (req, res) => {
  const { BatchTeacher, Batch } = getModels(req);
  try {
    const { teacherId } = req.params;

    // Step 1: Get all batchIds of that teacher
    const teacherLinks = await BatchTeacher.find({ teacherId });

    const batchIds = teacherLinks.map((tb) => tb.batchId);

    // Step 2: Fetch batch details
    const batches = await Batch.find({
      _id: { $in: batchIds },
      archive: false,
    }).select("name");

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherAttendance = async (req, res) => {
  const { AttendanceTeacher } = getModels(req);
  try {
    const { batchId } = req.params;

    const attendance = await AttendanceTeacher.find({ batchId });

    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markTeacherAttendance = async (req, res) => {
  const { AttendanceTeacher } = getModels(req);
  const { teacherId, batchId, date, status } = req.body;
  try {
    const record = await AttendanceTeacher.findOneAndUpdate(
      { teacherId, batchId, date },
      { teacherId, batchId, date, status, markedBy: req.user.id },
      { upsert: true, new: true }
    );
    res.json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeTeacherAttendance = async (req, res) => {
  const { AttendanceTeacher } = getModels(req);
  const { teacherId, batchId, date } = req.body;
  try {
    const d = new Date(date);
    const start = new Date(d.getTime() - 12 * 60 * 60 * 1000);
    const end = new Date(d.getTime() + 12 * 60 * 60 * 1000);

    const result = await AttendanceTeacher.deleteMany({
      teacherId,
      batchId,
      date: { $gte: start, $lte: end },
    });

    res.json({ message: "Attendance removed", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  const { Teacher, BatchTeacher } = getModels(req);
  try {
    const {
      name,
      email,
      phone,
      dob,
      address,
      qualification,
      aadhar,
      experience,
    } = req.body;

    if (!name || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required." });
    }

    const trimmedEmail = email.trim();
    const existingTeacher = await Teacher.findOne({ email: trimmedEmail });

    if (existingTeacher) {
      return res
        .status(400)
        .json({ message: "Teacher with the same email already exists." });
    }

    const teacher = await Teacher.create({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      role: "Teacher",
      dob: dob?.trim() || "",
      address: address?.trim() || "",
      qualification: qualification?.trim() || "",
      aadhar: aadhar?.trim() || "",
      experience: experience ? Number(experience) : 0,
    });

    res.status(201).json({ message: "Teacher created successfully.", teacher });
  } catch (err) {
    console.error("Teacher creation error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  const { Teacher, BatchTeacher } = getModels(req);
  try {
    const teacherId = req.params.teacherId;

    // delete from Teacher
    await Teacher.findOneAndDelete({
      _id: teacherId,
    });

    // delete from Batch_teachers
    await BatchTeacher.deleteMany({
      teacherId: teacherId,
    });

    res.json({ message: "Teacher removed from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeTeacherFromBatch = async (req, res) => {
  const { BatchTeacher } = getModels(req);
  const { batchId, teacherId } = req.body;

  if (!batchId || !teacherId) {
    return res.status(400).json({ error: "Missing batchId or teacherId" });
  }
  try {
    await BatchTeacher.findOneAndDelete({ batchId, teacherId });

    res.json({ message: "Teacher removed." });
  } catch (err) {
    console.error("Remove teacher error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.editTeacher = async (req, res) => {
  const { Teacher } = getModels(req);
  try {
    const { teacherId } = req.params;
    const {
      name,
      email,
      phone,
      dob,
      address,
      qualification,
      aadhar,
      experience,
    } = req.body;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        error: "Name, email, and phone are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Please provide a valid email address",
      });
    }

    // Check if email already exists for another teacher
    const existingTeacher = await Teacher.findOne({
      email: email,
      _id: { $ne: teacherId },
    });

    if (existingTeacher) {
      return res.status(400).json({
        error: "Email already exists for another teacher",
      });
    }

    // Update teacher (only editable fields)
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        dob: dob?.trim() || null,
        address: address?.trim() || "",
        qualification: qualification?.trim() || "",
        aadhar: aadhar || null,
        experience: experience || null,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedTeacher) {
      return res.status(404).json({
        error: "Teacher not found",
      });
    }

    res.json(updatedTeacher);
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

exports.addTeacherToBatches = async (req, res) => {
  const { Batch, BatchTeacher, Teacher } = getModels(req);
  try {
    const { batchIds, teacherId } = req.body;

    if (!Array.isArray(batchIds)) {
      return res.status(400).json({ message: "Invalid batchIds array." });
    }

    // Validate teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Step 1: Fetch batch names
    const batches = await Batch.find({ _id: { $in: batchIds } });
    if (batches.length === 0) {
      return res.status(404).json({ message: "No valid batches found." });
    }

    // Step 2: Prepare bulk operations (update if exists, insert if not)
    const bulkOps = batches.map((batch) => ({
      updateOne: {
        filter: { batchId: batch._id }, // find by batchId (unique)
        update: {
          $set: {
            teacherId: teacher._id,
            batchName: batch.name,
          },
        },
        upsert: true, // create new if doesn't exist
      },
    }));

    // Step 3: Execute bulkWrite
    await BatchTeacher.bulkWrite(bulkOps);

    // Step 4: Return response
    return res.status(200).json({
      message: "Batches successfully assigned or reassigned to teacher.",
      assignedBatches: batches,
    });
  } catch (err) {
    console.error("Assign Batches Error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Fee tracking
exports.getUnpaidInstallments = async (req, res) => {
  const { Installment } = getModels(req);
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const installments = await Installment.find({
      dueDate: { $lt: today }, // strictly before today (yesterday and earlier)
      $or: [{ paidDate: { $exists: false } }, { paidDate: null }],
    })
      .populate("studentId")
      .populate("feeId");

    res.json(installments);
  } catch (err) {
    console.error("Error fetching unpaid installments:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getUpcomingInstallments = async (req, res) => {
  const { Installment } = getModels(req);
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const upcomingInstallments = await Installment.find({
      dueDate: { $gte: today }, // today and future
      $or: [{ paidDate: { $exists: false } }, { paidDate: null }],
    })
      .populate("studentId")
      .populate("feeId");

    res.json(upcomingInstallments);
  } catch (err) {
    console.error("Error fetching upcoming installments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPaidInstallments = async (req, res) => {
  const { Installment } = getModels(req);
  try {
    const installments = await Installment.find({
      paidDate: { $ne: null },
    })
      .populate("studentId")
      .populate("feeId")
      .sort({ paidDate: -1 });

    const totalPaidAmount = installments.reduce((sum, inst) => {
      return sum + (inst.amount || 0);
    }, 0);

    res.json({ installments, totalPaidAmount });
  } catch (err) {
    console.error("Error fetching paid installments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// today's classes
exports.getTodaysClasses = async (req, res) => {
  const { Timetable } = getModels(req);
  try {
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }).format(new Date());

    // Fetch and populate batch details
    const classes = await Timetable.find({ weekday: today }).populate(
      "batchId",
      "name code class archive"
    );

    // Filter out archived batches
    const activeClasses = classes.filter((cls) => !cls.batchId?.archive);

    const flattenedTimings = activeClasses.flatMap((cls) => {
      return cls.classTimings.map((slot) => {
        return {
          weekday: cls.weekday,
          batch: {
            id: cls.batchId._id,
            name: cls.batchId.name,
            code: cls.batchId.code,
            class: cls.batchId.class,
          },
          timing: {
            startTime: slot.startTime,
            endTime: slot.endTime,
          },
        };
      });
    });

    // Sort all class timings by time (individually)
    const parseTime = (timeStr) =>
      new Date(`1970-01-01T${convertTo24Hour(timeStr)}:00`);

    flattenedTimings.sort(
      (a, b) => parseTime(a.timing.startTime) - parseTime(b.timing.startTime)
    );

    res.json({ today, classes: flattenedTimings });
  } catch (err) {
    console.error("Error fetching today's classes:", err);
    res.status(500).json({ message: "Failed to fetch today's classes." });
  }
};

// Upload excel
exports.uploadExcelSheet = async (req, res) => {
  const { Student } = getModels(req);
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ message: "The uploaded sheet has no data rows." });
    }

    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    const allowedClasses = [
      "Kids",
      "English Spoken",
      "9",
      "10",
      "11",
      "12",
      "Entrance Exams",
      "Graduation",
    ];
    const requiredFields = [
      "name",
      "phone",
      "dob",
      "address",
      "class",
      "dateOfJoining",
    ];

    // Validate + normalize every row. Required fields must be present and
    // dates/class must be valid; guardianName, guardianPhone, schoolType are optional.
    const errors = [];
    const uploadedStudents = [];

    data.forEach((row, idx) => {
      const rowNum = idx + 2; // +1 for header row, +1 for 1-based numbering
      const val = (key) =>
        row[key] === undefined || row[key] === null
          ? ""
          : row[key].toString().trim();

      const schoolTypeRaw = val("schoolType");
      const student = {
        name: val("name"),
        phone: val("phone"),
        dob: val("dob"),
        address: val("address"),
        class: val("class"),
        dateOfJoining: val("dateOfJoining"),
        guardianName: val("guardianName"),
        guardianPhone: val("guardianPhone"),
        schoolType: ["Government", "Private"].includes(schoolTypeRaw)
          ? schoolTypeRaw
          : "NA",
      };

      const missing = requiredFields.filter((f) => !student[f]);
      if (missing.length > 0) {
        errors.push(`Row ${rowNum}: missing required field(s): ${missing.join(", ")}`);
        return;
      }

      if (!dateRegex.test(student.dob)) {
        errors.push(`Row ${rowNum}: dob must be in DD-MM-YYYY format`);
      }
      if (!dateRegex.test(student.dateOfJoining)) {
        errors.push(`Row ${rowNum}: dateOfJoining must be in DD-MM-YYYY format`);
      }
      if (!allowedClasses.includes(student.class)) {
        errors.push(`Row ${rowNum}: invalid class "${student.class}"`);
      }

      uploadedStudents.push(student);
    });

    if (errors.length > 0) {
      const shown = errors.slice(0, 15);
      const extra =
        errors.length > shown.length
          ? `\n...and ${errors.length - shown.length} more issue(s)`
          : "";
      return res.status(400).json({
        message: `Upload failed. Please fix these and re-upload:\n${shown.join("\n")}${extra}`,
      });
    }

    // Step 1: Remove duplicates within uploaded sheet
    const uniqueBySheet = [];
    const seen = new Set();

    for (const student of uploadedStudents) {
      const key = `${student.name.toLowerCase()}-${student.phone}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueBySheet.push(student);
      }
    }

    // Step 2: Remove duplicates against DB
    const existing = await Student.find({
      $or: uniqueBySheet.map((s) => ({
        phone: s.phone,
        dob: s.dob,
      })),
    });

    const existingKeys = new Set(
      existing.map((s) => `${s.name.toLowerCase()}-${s.phone}`)
    );

    const finalToInsert = uniqueBySheet.filter(
      (s) => !existingKeys.has(`${s.name.toLowerCase()}-${s.phone}`)
    );

    if (finalToInsert.length === 0) {
      return res.status(400).json({ message: "No unique students to insert." });
    }

    const insertedStudents = await Student.insertMany(finalToInsert);
    res.json({
      message: `${insertedStudents.length} students uploaded successfully`,
      insertedStudents,
    });
  } catch (error) {
    console.error("Excel upload error:", error);
    res.status(500).json({ message: "Error uploading students", error });
  }
};

// Get today's birthdays
exports.getTodaysBirthdays = async (req, res) => {
  const { Student, BirthdayWish, Teacher, TeacherBirthdayWish } =
    getModels(req);

  try {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const todayDay = nowIST.day;
    const todayMonth = nowIST.month;

    // Today's start and end in IST for BirthdayWish
    const startOfDay = nowIST.startOf("day").toJSDate();
    const endOfDay = nowIST.endOf("day").toJSDate();

    const students = await Student.find({ dob: { $exists: true, $ne: null } });

    const todaysBirthdays = await Promise.all(
      students.map(async (s) => {
        const [day, month, year] = s.dob.split("-");
        if (parseInt(day) === todayDay && parseInt(month) === todayMonth) {
          // Check if already wished today
          const wished = await BirthdayWish.exists({
            studentId: s._id,
            wishedOn: { $gte: startOfDay, $lte: endOfDay },
          });
          return { ...s.toObject(), wished: !!wished };
        }
        return null;
      })
    );

    const filtered = todaysBirthdays.filter(Boolean);

    res.json({ students: filtered, totalBirthdays: filtered.length });
  } catch (err) {
    console.error("Error fetching birthdays:", err);
    res.status(500).json({ message: "Failed to fetch today's birthdays." });
  }
};

// Mark wish as sent  for student
exports.markBirthdayWished = async (req, res) => {
  const { BirthdayWish } = getModels(req);
  try {
    const { studentId } = req.body;
    if (!studentId)
      return res.status(400).json({ message: "studentId required" });

    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const startOfDay = nowIST.startOf("day").toJSDate();
    const endOfDay = nowIST.endOf("day").toJSDate();

    // Check if already wished
    const existing = await BirthdayWish.findOne({
      studentId,
      wishedOn: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res.json({ message: "Already wished", wished: true });
    }

    await BirthdayWish.create({
      studentId,
      wishedOn: nowIST.toJSDate(), // Store IST timestamp
    });

    res.json({ message: "Wish marked as sent", wished: true });
  } catch (err) {
    console.error("Error marking wish:", err);
    res.status(500).json({ message: "Failed to mark wish." });
  }
};

exports.getTodaysTeacherBirthdays = async (req, res) => {
  const { Teacher, TeacherBirthdayWish } = getModels(req);
  try {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const todayDay = nowIST.day;
    const todayMonth = nowIST.month;

    // Today's start and end in IST for BirthdayWish
    const startOfDay = nowIST.startOf("day").toJSDate();
    const endOfDay = nowIST.endOf("day").toJSDate();

    const teachers = await Teacher.find({ dob: { $exists: true, $ne: null } });

    const todaysTeachersBirthdays = await Promise.all(
      teachers.map(async (s) => {
        const [day, month, year] = s.dob.split("-");
        if (parseInt(day) === todayDay && parseInt(month) === todayMonth) {
          // Check if already wished today
          const wished = await TeacherBirthdayWish.exists({
            teacherId: s._id,
            wishedOn: { $gte: startOfDay, $lte: endOfDay },
          });
          return { ...s.toObject(), wished: !!wished };
        }
        return null;
      })
    );

    const filtered = todaysTeachersBirthdays.filter(Boolean);

    res.json({ teachers: filtered, totalTeachersBirthdays: filtered.length });
  } catch (err) {
    console.error("Error fetching birthdays:", err);
    res.status(500).json({ message: "Failed to fetch today's birthdays." });
  }
};

// Mark wish as sent for techer
exports.markTeacherBirthdayWished = async (req, res) => {
  const { TeacherBirthdayWish } = getModels(req);
  try {
    const { teacherId } = req.body;
    if (!teacherId)
      return res.status(400).json({ message: "teacherId required" });

    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const startOfDay = nowIST.startOf("day").toJSDate();
    const endOfDay = nowIST.endOf("day").toJSDate();

    // Check if already wished
    const existing = await TeacherBirthdayWish.findOne({
      teacherId,
      wishedOn: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existing) {
      return res.json({ message: "Already wished", wished: true });
    }

    await TeacherBirthdayWish.create({
      teacherId,
      wishedOn: nowIST.toJSDate(), // Store IST timestamp
    });

    res.json({ message: "Wish marked as sent", wished: true });
  } catch (err) {
    console.error("Error marking wish:", err);
    res.status(500).json({ message: "Failed to mark wish." });
  }
};

// Upcoming Student Birthdays (next 7 days, excluding today)
exports.getUpcomingBirthdays = async (req, res) => {
  const { Student } = getModels(req);
  try {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const students = await Student.find({ dob: { $exists: true, $ne: null } });

    const upcoming = [];
    for (const s of students) {
      const [day, month] = s.dob.split("-").map(Number);
      if (!day || !month) continue;
      for (let d = 1; d <= 7; d++) {
        const future = nowIST.plus({ days: d });
        if (future.day === day && future.month === month) {
          upcoming.push({ ...s.toObject(), birthdayDate: `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}`, daysAway: d });
          break;
        }
      }
    }

    upcoming.sort((a, b) => a.daysAway - b.daysAway);
    res.json({ students: upcoming, total: upcoming.length });
  } catch (err) {
    console.error("Error fetching upcoming birthdays:", err);
    res.status(500).json({ message: "Failed to fetch upcoming birthdays." });
  }
};

// Upcoming Teacher Birthdays (next 7 days, excluding today)
exports.getUpcomingTeacherBirthdays = async (req, res) => {
  const { Teacher } = getModels(req);
  try {
    const nowIST = DateTime.now().setZone("Asia/Kolkata");
    const teachers = await Teacher.find({ dob: { $exists: true, $ne: null } });

    const upcoming = [];
    for (const t of teachers) {
      const [day, month] = t.dob.split("-").map(Number);
      if (!day || !month) continue;
      for (let d = 1; d <= 7; d++) {
        const future = nowIST.plus({ days: d });
        if (future.day === day && future.month === month) {
          upcoming.push({ ...t.toObject(), birthdayDate: `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}`, daysAway: d });
          break;
        }
      }
    }

    upcoming.sort((a, b) => a.daysAway - b.daysAway);
    res.json({ teachers: upcoming, total: upcoming.length });
  } catch (err) {
    console.error("Error fetching upcoming teacher birthdays:", err);
    res.status(500).json({ message: "Failed to fetch upcoming teacher birthdays." });
  }
};

// Enquiries
exports.getAllEnquiries = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const enquiries = await Enquiry.find();
    res.json(enquiries);
  } catch (err) {
    console.error("Error fetching enquiries:", err);
    res.status(500).json({ message: "Failed to fetch enquiries." });
  }
};

exports.createEnquiry = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const studentName = req.body.studentName?.trim();
    const phone = req.body.phone?.trim();
    const enquiryDate = req.body.enquiryDate?.trim();
    const followupDate = req.body.followupDate?.trim();
    const classSubject = req.body.classSubject?.trim();
    const followupType = req.body.followupType?.trim();
    const notes = req.body.notes?.trim() || "";

    // Basic required validation
    if (
      !studentName ||
      !phone ||
      !enquiryDate ||
      !followupDate ||
      !classSubject ||
      !followupType
    ) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Validate date format DD-MM-YYYY (consistent with other models)
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!dateRegex.test(enquiryDate) || !dateRegex.test(followupDate)) {
      return res
        .status(400)
        .json({ message: "Dates must be in DD-MM-YYYY format." });
    }

    // Validate followupType
    const allowedFollowup = ["demo", "call"];
    if (!allowedFollowup.includes(followupType)) {
      return res
        .status(400)
        .json({ message: `followupType must be one of: ${allowedFollowup.join(", ")}` });
    }

    const newEnquiry = await Enquiry.create({
      studentName,
      phone,
      enquiryDate,
      followupDate,
      classSubject,
      followupType,
      notes,
    });

    res.status(201).json({ message: "Enquiry created", enquiry: newEnquiry });
  } catch (err) {
    console.error("Error creating enquiry:", err);
    res.status(500).json({ message: "Failed to create enquiry." });
  }
};

exports.deleteEnquiry = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const { enquiryId } = req.params;
    if (!enquiryId) {
      return res.status(400).json({ message: "enquiryId is required" });
    }

    const deletedEnquiry = await Enquiry.findByIdAndDelete(enquiryId);
    if (!deletedEnquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ message: "Enquiry deleted successfully", enquiry: deletedEnquiry });
  } catch (err) {
    console.error("Error deleting enquiry:", err);
    res.status(500).json({ message: "Failed to delete enquiry." });
  }
};

exports.getEnquiry = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const { enquiryId } = req.params;
    if (!enquiryId) {
      return res.status(400).json({ message: "enquiryId is required" });
    }

    const enquiry = await Enquiry.findById(enquiryId);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json(enquiry);
  } catch (err) {
    console.error("Error fetching enquiry:", err);
    res.status(500).json({ message: "Failed to fetch enquiry." });
  }
};

exports.updateEnquiryStatus = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const { enquiryId } = req.params;
    const { status } = req.body;

    if (!enquiryId) {
      return res.status(400).json({ message: "enquiryId is required" });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { status },
      { new: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ message: "Enquiry status updated", enquiry: updatedEnquiry });
  } catch (err) {
    console.error("Error updating enquiry status:", err);
    res.status(500).json({ message: "Failed to update enquiry status." });
  }
};

exports.editEnquiry = async (req, res) => {
  const { Enquiry } = getModels(req);
  try {
    const { enquiryId } = req.params;
    const { studentName, phone, enquiryDate, followupDate, classSubject, followupType, notes } = req.body;

    if (!enquiryId) {
      return res.status(400).json({ message: "enquiryId is required" });
    }

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      { studentName, phone, enquiryDate, followupDate, classSubject, followupType, notes },
      { new: true }
    );

    if (!updatedEnquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.json({ message: "Enquiry updated successfully", enquiry: updatedEnquiry });
  } catch (err) {
    console.error("Error updating enquiry:", err);
    res.status(500).json({ message: "Failed to update enquiry." });
  }
};