const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

// Batch Management
router.get('/batches', adminController.getBatches);
router.get('/batchStudents/:batchId', adminController.getBatchStudents);
router.get('/attendance/:studentId', adminController.getStudentsAttendance);
router.get('/findTeacher/:batchId', adminController.getTeacher);
router.post('/attendance/mark', adminController.markAttendance);
router.post('/batchCreate', adminController.createBatch);


router.delete('/batch/:id', adminController.deleteBatch);

// Student Management
router.get('/students', adminController.getStudents);
router.get('/studentBatches/:studentId', adminController.getStudentBatches);
router.get('/student-fee-status/:studentId', adminController.getStudentFeeStatus);
router.post('/studentCreate', adminController.createStudent);


router.post('/batch/:batchId/student', adminController.addStudentToBatch);
router.delete('/batch/:batchId/student/:studentId', adminController.removeStudentFromBatch);


// Teacher Management
router.get('/teachers', adminController.getTeachers);
router.get('/teacherBatches/:teacherId', adminController.getTeacherBatches);
router.post('/teacherCreate', adminController.createTeacher);


// Attendance & Fee
router.post('/fee-status/update', adminController.updateFeeStatus);

module.exports = router;