const Batch = require("../models/Batch");
const BatchStudent = require("../models/Batch_students");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Student = require("../models/Student");
const Teacher = require("../models/Admins_teachers");
const BatchTeacher = require("../models/Batch_teachers");

// Batches Management
exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
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

exports.getStudentsAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    const attendance = await Attendance.find({ studentId });

    res.json({ attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacher = async (req, res) => {
  try {
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

exports.createBatch = async (req, res) => {
  try {
    const existingBatch = await Batch.findOne({ name: req.body.name.trim() });

    if (existingBatch) {
      return res
        .status(400)
        .json({ message: "Batch with same name already exists." });
    }

    const batch = await Batch.create({ name: req.body.name.trim() });
    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;

    // delete from Batch
    await Batch.findOneAndDelete({
      _id: batchId,
    });

    // delete from Batch_teachers
    await BatchTeacher.deleteMany({
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

    res.json({ message: "Batch removed from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.assignTeacher = async (req, res) => {
  try {
    const batchId = req.params.batchId;
    const teacherId = req.params.teacherId;
    // Check if the batch exists
    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: "Batch not found." });
    }

    // Check if the teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found." });
    }

    // Check if assignment already exists
    const existing = await BatchTeacher.findOne({ batchId });
    if (existing) {
      // Update the teacher assignment
      existing.teacherId = teacherId;
      existing.batchName = batch.name;
      await existing.save();
    } else {
      // Create a new assignment
      await BatchTeacher.create({
        batchId,
        batchName: batch.name,
        teacherId,
      });
    }

    return res.json({ message: "Teacher assigned successfully." });
  } catch (error) {
    console.error("Error assigning teacher:", error);
    return res
      .status(500)
      .json({ message: "Server error. Could not assign teacher." });
  }
};

// Students Management
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentBatches = async (req, res) => {
  try {
    const { studentId } = req.params;

    // Step 1: Get all batchIds of that student
    const studentLinks = await BatchStudent.find({ studentId });

    const batchIds = studentLinks.map((sb) => sb.batchId);

    // Step 2: Fetch batch details
    const batches = await Batch.find({ _id: { $in: batchIds } }).select("name");

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentFeeStatus = async (req, res) => {
  try {
    const { studentId } = req.params;

    const feeStatus = await Fee.find({ studentId });

    res.json({ feeStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createStudent = async (req, res) => {
  try {
    const existingStudent = await Student.findOne({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with same name and phone number already exists.",
      });
    }

    const student = await Student.create({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      dob: req.body.dob.trim(), // this must match DD-MM-YYYY
    });

    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
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
    res.json({ message: "Student removed from database" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeStudentFromBatch = async (req, res) => {
  try {
    await BatchStudent.findOneAndDelete({
      studentId: req.params.studentId,
      batchId: req.params.batchId,
    });
    res.json({ message: "Student removed from batch" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addStudentToBatch = async (req, res) => {
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

exports.updateFeeStatus = async (req, res) => {
  const { studentId } = req.params;
  const { month, amount } = req.body;
  const paidOn = new Date();

  if (!month || !amount) {
    return res
      .status(400)
      .json({ message: "All fields are required (month, amount)" });
  }

  try {
    // Check if a record already exists for the same student + month
    const existing = await Fee.findOne({ studentId, month });

    let feeRecord;
    if (existing) {
      // Update existing
      existing.amount = amount;
      existing.paidOn = paidOn;
      feeRecord = await existing.save();
    } else {
      // Create new
      feeRecord = await Fee.create({
        studentId,
        amount,
        month,
        paidOn,
      });
    }

    res
      .status(200)
      .json({ message: "Fee updated successfully", fee: feeRecord });
  } catch (err) {
    console.error("Error updating fee:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Teachers Management
exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTeacherBatches = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // Step 1: Get all batchIds of that teacher
    const teacherLinks = await BatchTeacher.find({ teacherId });

    const batchIds = teacherLinks.map((tb) => tb.batchId);

    // Step 2: Fetch batch details
    const batches = await Batch.find({ _id: { $in: batchIds } }).select("name");

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const existingTeacher = await Teacher.findOne({
      email: req.body.email.trim(),
    });

    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher with same email already exists.",
      });
    }

    const teacher = await Teacher.create({
      name: req.body.name.trim(),
      email: req.body.email.trim(),
      role: "teacher",
    });

    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
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
  try {
    await BatchTeacher.findOneAndDelete({
      teacherId: req.params.teacherId,
      batchId: req.params.batchId,
    });
    res.json({ message: "Teacher removed from batch" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
