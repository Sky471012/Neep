const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.use(verifyToken, isTeacher);

router.get('/batches', teacherController.getBatches);
router.get('/batchStudents/:batchId', teacherController.getBatchStudents);
router.get('/attendance/:studentId', teacherController.getStudentsAttendance);
router.post('/attendance/mark', teacherController.markAttendance);
router.get('/timetable/:batchId', teacherController.getTimetable);
router.post('/test/add', teacherController.addTest);
router.get('/getTest/:batchId', teacherController.getTest);

module.exports = router;