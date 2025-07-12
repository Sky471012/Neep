const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

// Batch Management
router.get('/batches', adminController.getBatches);
router.get('/getBatchDetails/:batchId', adminController.getBatch);
router.get('/batchStudents/:batchId', adminController.getBatchStudents);
router.get('/findTeacher/:batchId', adminController.getTeacher);
router.get('/attendance/:studentId', adminController.getStudentsAttendance);
router.post('/attendance/mark', adminController.markAttendance);
router.post('/batchCreate', adminController.createBatch);
router.delete('/batchDelete/:batchId', adminController.deleteBatch);
router.post('/assignTeacher/:batchId/:teacherId', adminController.assignTeacher)

// Student Management
router.get('/students', adminController.getStudents);
router.get('/studentBatches/:studentId', adminController.getStudentBatches);
router.get('/student-fee-status/:studentId', adminController.getStudentFeeStatus);
router.post('/studentCreate', adminController.createStudent);
router.delete('/studentDelete/:studentId', adminController.deleteStudent);
router.delete('/removeStudent/:studentId/:batchId', adminController.removeStudentFromBatch);
router.post('/addStudent/:studentId/:batchId', adminController.addStudentToBatch);
router.post('/update-fee/:studentId', adminController.updateFeeStatus);

// Teacher Management
router.get('/teachers', adminController.getTeachers);
router.get('/teacherBatches/:teacherId', adminController.getTeacherBatches);
router.post('/teacherCreate', adminController.createTeacher);
router.delete('/teacherDelete/:teacherId', adminController.deleteTeacher);
router.delete('/removeTeacher/:teacherId/:batchId', adminController.removeTeacherFromBatch);

module.exports = router;