const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.use(verifyToken, isTeacher);

router.get('/batches', teacherController.getBatches);
router.get('/batchStudents/:batchId', teacherController.getBatchStudents);
router.get('/attendance/:studentId', teacherController.getStudentsAttendance);
router.post('/attendance/mark', teacherController.markAttendance);

module.exports = router;