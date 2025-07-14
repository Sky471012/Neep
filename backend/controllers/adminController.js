const Batch = require("../models/Batch");
const BatchStudent = require("../models/Batch_students");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/TimeTable");
const Test = require("../models/Test");
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

exports.getBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const batch = await Batch.findById(batchId);
    res.json(batch);
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

exports.getBatchTimetable = async (req, res) => {
  try {
    const { batchId } = req.params;

    const timetable = await Timetable.find({ batchId });

    res.json({ timetable });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBatchTeacher = async (req, res) => {
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

exports.createBatch = async (req, res) => {
  try {
    const name = req.body.name?.trim();
    const startDate = req.body.startDate?.trim();
    let code = req.body.code?.trim();

    if (!name || !startDate) {
      return res.status(400).json({ message: "Name and startDate are required." });
    }

    const existingBatch = await Batch.findOne({ name });

    if (existingBatch) {
      return res
        .status(400)
        .json({ message: "Batch with same name already exists." });
    }

    // Generate code if not provided
    if (!code) {
      code = `B-${Date.now().toString().slice(-6)}`;
    }

    const batch = await Batch.create({
      name,
      code,
      startDate,
    });

    res.json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTimetable = async (req, res) => {
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
    const existingStudentIds = existingLinks.map((link) => link.studentId.toString());

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
  const { batchId } = req.params;

  try {
    const existingStudent = await Student.findOne({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      dob: req.body.dob.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with same name, phone and DOB already exists.",
      });
    }

    const student = await Student.create({
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      dob: req.body.dob.trim(), // must be DD-MM-YYYY
      address: req.body.address.trim(),
      class: req.body.class.trim(),
      fee: req.body.fee,
      dateOfJoining: req.body.dateOfJoining.trim(), // must be DD-MM-YYYY
    });

    const batchStudent = await BatchStudent.create({
      batchId,
      batchName: req.body.batchName,
      studentId: student._id,
    });

    res.status(201).json({ message: "Student created and added to batch.", student });
  } catch (err) {
    console.error("Error creating student:", err);
    res.status(500).json({ error: err.message });
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

exports.getStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    res.json(student);
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
    const {
      name,
      phone,
      dob,
      address,
      class: studentClass,
      fee,
      dateOfJoining
    } = req.body;

    // Check if student exists
    const existingStudent = await Student.findOne({
      name: name.trim(),
      phone: phone.trim(),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "Student with same name and phone number already exists.",
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
    const allowedClasses = ["Kids", "English Spoken", "9", "10", "11", "12"];
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
      fee,
      dateOfJoining: dateOfJoining.trim(),
    });

    res.status(200).json(student);
  } catch (err) {
    console.error("Create Student Error:", err);
    res.status(500).json({ error: "Internal server error." });
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

exports.addStudentToBatches = async (req, res) => {
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
    const existingBatchIds = existingLinks.map(link => link.batchId.toString());

    // Step 2: Filter out already-added batch IDs
    const newBatchIds = batchIds.filter(id => !existingBatchIds.includes(id));

    if (newBatchIds.length === 0) {
      return res.status(400).json({ message: "No new batches to add." });
    }

    // Step 3: Fetch batch names for these newBatchIds
    const newBatches = await Batch.find({ _id: { $in: newBatchIds } });

    // Step 4: Create batch-student links
    const newLinks = newBatches.map(batch => ({
      batchId: batch._id,
      batchName: batch.name,
      studentId: student._id
    }));

    await BatchStudent.insertMany(newLinks);

    // Step 5: Return added batches
    return res.status(200).json({
      message: "Batches added successfully.",
      addedBatches: newBatches
    });

  } catch (err) {
    console.error("Add Batches Error:", err);
    return res.status(500).json({ message: "Internal server error." });
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

exports.getTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);
    res.json(teacher);
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
    const { name, email, phone } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
      return res.status(400).json({ message: "Name, email, and phone are required." });
    }

    const trimmedEmail = email.trim();

    const existingTeacher = await Teacher.findOne({ email: trimmedEmail });

    if (existingTeacher) {
      return res.status(400).json({
        message: "Teacher with the same email already exists.",
      });
    }

    const teacher = await Teacher.create({
      name: name.trim(),
      email: trimmedEmail,
      phone: phone.trim(),
      role: "teacher",
    });

    res.json(teacher);
  } catch (err) {
    console.error("Teacher creation error:", err);
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