const Teacher = require('../models/Admins_teachers');
const Attendance = require('../models/Attendance');

exports.getTeacher = async (req, res) => {
  try {
    const credentials = await Teacher.findById( req.user.id );
    res.json(credentials);
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