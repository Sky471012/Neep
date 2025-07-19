const Batch = require("../models/Batch");
const BatchStudent = require("../models/Batch_students");
const Attendance = require("../models/Attendance");
const Timetable = require("../models/TimeTable");
const Test = require("../models/Test");
const Fee = require("../models/Fee");
const Installment = require("../models/Installment");
const Student = require("../models/Student");
const Teacher = require("../models/Admins_teachers");
const BatchTeacher = require("../models/Batch_teachers");
const XLSX = require("xlsx");

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
    const batches = await Batch.find({ archive: false }); // Only unarchived batches
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArchivedBatches = async (req, res) => {
  try {
    const archivedBatches = await Batch.find({ archive: true }); // Only archived batches
    res.json(archivedBatches);
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

exports.getStudentstests = async (req, res) => {
  try {
    const { studentId } = req.params;

    const tests = await Test.find({ studentId });

    res.json({ tests });
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

exports.addEditTest = async (req, res) => {
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

exports.createBatch = async (req, res) => {
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
      dateOfJoining: req.body.dateOfJoining.trim(), // must be DD-MM-YYYY
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
  try {
    const { batchId } = req.params;
    const {
      name,
      class: batchClass,
      startDate,
    } = req.body;

    // Validate required fields
    if (!name || !batchClass || !startDate) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Validate startDate format (DD-MM-YYYY)
    const startDateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(19|20)\d{2}$/;
    if (!startDateRegex.test(startDate)) {
      return res.status(400).json({
        error: "Start date must be in DD-MM-YYYY format",
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
    if (!validClasses.includes(batchClass)) {
      return res.status(400).json({
        error: "Invalid class selection",
      });
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
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedBatch) {
      return res.status(404).json({
        error: "Batch not found",
      });
    }

    res.json(updatedBatch);
  } catch (error) {
    console.error("Error updating batch:", error);

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

// Student Management
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
  try {
    const { studentId } = req.params;

    const fee = await Fee.find({ studentId });

    res.json({ fee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStudentInstallments = async (req, res) => {
  try {
    const { studentId } = req.params;

    const installments = await Installment.find({ studentId });

    res.json({ installments });
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
      dateOfJoining,
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

exports.updateFee = async (req, res) => {
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
  try {
    const { id } = req.params;
    const updateFields = {};
    const { amount, dueDate, paidDate, method } = req.body;

    if (amount !== undefined) updateFields.amount = amount;
    if (dueDate !== undefined) updateFields.dueDate = dueDate;

    if (paidDate === null || paidDate === "") {
      updateFields.paidDate = null;
      updateFields.method = null;
    } else if (paidDate !== undefined) {
      updateFields.paidDate = paidDate;
      if (method) updateFields.method = method;
    }

    const updated = await Installment.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Installment not found" });
    }

    return res.json({
      message: "Installment updated successfully",
      installment: updated,
    });
  } catch (error) {
    console.error("Error updating installment:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
  try {
    const { studentId } = req.params;
    const {
      name,
      phone,
      dob,
      address,
      class: studentClass,
      dateOfJoining,
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
        error: "Student with same name and phone number already exists",
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
    const batches = await Batch.find({
      _id: { $in: batchIds },
      archive: false,
    }).select("name");

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
      return res
        .status(400)
        .json({ message: "Name, email, and phone are required." });
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
      role: "Teacher",
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

exports.editTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, email, phone } = req.body;

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

// Fee tracking
exports.getUnpaidInstallments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const installments = await Installment.find({
      dueDate: { $lte: new Date() },
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
  try {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0); // Set to start of today
    tomorrow.setDate(tomorrow.getDate() + 1); // Move to tomorrow

    const upcomingInstallments = await Installment.find({
      dueDate: { $gte: tomorrow },
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

// controllers/adminController.js

exports.getPaidInstallments = async (req, res) => {
  try {
    const installments = await Installment.find({
      paidDate: { $ne: null },
    })
      .populate("studentId")
      .populate("feeId");

    // Sort by paidDate descending (most recently paid first)
    const sorted = installments.sort(
      (a, b) => new Date(b.paidDate) - new Date(a.paidDate)
    );

    const totalPaidAmount = sorted.reduce((sum, inst) => {
      return sum + (inst.amount || 0);
    }, 0);

    res.json({ installments: sorted, totalPaidAmount });
  } catch (err) {
    console.error("Error fetching paid installments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// today's classes
exports.getTodaysClasses = async (req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

    // Populate batchId with archive field to filter after
    const classes = await Timetable.find({ weekday: today }).populate(
      "batchId",
      "name code archive"
    );

    // Filter out archived batches
    const activeClasses = classes.filter((cls) => !cls.batchId?.archive);

    const formatted = activeClasses.map((cls) => {
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
    console.error("Error fetching today's classes:", err);
    res.status(500).json({ message: "Failed to fetch today's classes." });
  }
};

// Upload excel
exports.uploadExcelSheet = async (req, res) => {
  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Normalize: trim and lowercase name + string phone
    const uploadedStudents = data.map((row) => ({
      name: row.name?.trim(),
      phone: row.phone?.toString().trim(),
      dob: row.dob?.trim(),
      address: row.address?.trim(),
      class: row.class?.trim(),
      dateOfJoining: row.dateOfJoining?.trim(),
    }));

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
        name: s.name,
        phone: s.phone,
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
