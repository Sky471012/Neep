const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

// Batch Management
router.get('/batches', adminController.getBatches);
router.get('/getBatchDetails/:batchId', adminController.getBatch);
router.get('/batchStudents/:batchId', adminController.getBatchStudents);
router.get('/batchTimetable/:batchId', adminController.getBatchTimetable);
router.get('/findTeacher/:batchId', adminController.getBatchTeacher);
router.get('/attendance/:studentId', adminController.getStudentsAttendance);
router.post('/attendance/mark', adminController.markAttendance);
router.post('/batchCreate', adminController.createBatch);
router.post('/updateTimetable/:batchId', adminController.updateTimetable);
router.delete('/batchDelete/:batchId', adminController.deleteBatch);
router.delete('/removeStudent', adminController.removeStudent);
router.post('/assignTeacher/:batchId/:teacherId', adminController.assignTeacher)
router.post('/addStudents', adminController.addStudentsToBatch);
router.post('/addStudentByCreating/:batchId', adminController.addStudentByCreating);

// Student Management
router.get('/students', adminController.getStudents);
router.get('/getStudentDetails/:studentId', adminController.getStudent);
router.get('/studentBatches/:studentId', adminController.getStudentBatches);
router.get('/student-fee-status/:studentId', adminController.getStudentFeeStatus);
router.post('/studentCreate', adminController.createStudent);
router.delete('/studentDelete/:studentId', adminController.deleteStudent);
router.post('/addStudent/:studentId/:batchId', adminController.addStudentToBatch);
router.post('/update-fee/:studentId', adminController.updateFeeStatus);
router.post('/addBatches', adminController.addStudentToBatches);

// Teacher Management
router.get('/teachers', adminController.getTeachers);
router.get('/getTeacherDetails/:teacherId', adminController.getTeacher);
router.get('/teacherBatches/:teacherId', adminController.getTeacherBatches);
router.post('/teacherCreate', adminController.createTeacher);
router.delete('/teacherDelete/:teacherId', adminController.deleteTeacher);
router.delete('/removeTeacher', adminController.removeTeacherFromBatch);

module.exports = router;