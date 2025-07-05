const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.use(verifyToken, isTeacher);

router.get('/', teacherController.getTeacher);
router.get('/batches', teacherController.getbatches);
router.get('/batchStudents/:batchId', teacherController.getBatchStudents);
router.post('/attendance/mark', teacherController.markAttendance);

module.exports = router;