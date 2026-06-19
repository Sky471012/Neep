const express = require('express');
const router = express.Router();
const branchMiddleware = require("../middleware/branchMiddleware");
const teacherController = require('../controllers/teacherController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

router.use(verifyToken, isTeacher, branchMiddleware);

router.get('/batches', teacherController.getBatches);
router.get('/batchStudents/:batchId', teacherController.getBatchStudents);
router.get('/attendance/:studentId', teacherController.getStudentsAttendance);
router.post('/attendance/mark', teacherController.markAttendance);
router.delete('/attendance/remove', teacherController.removeAttendance);
router.get('/timetable/:batchId', teacherController.getTimetable);
router.post('/test/add', teacherController.addTest);
router.get('/getTest/:batchId', teacherController.getTest);
router.get('/today/timetable', teacherController.getTodaysClassesForTeacher);
router.patch('/editMarks/:testId', teacherController.editMarks);
router.get('/attendance', teacherController.getAttendance);
router.delete('/deleteTest', teacherController.deleteTest);

module.exports = router;