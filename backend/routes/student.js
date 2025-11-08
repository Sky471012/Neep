const express = require('express');
const router = express.Router();
const branchMiddleware = require("../middleware/branchMiddleware");
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.use(verifyToken, isStudent, branchMiddleware);

router.get('/attendance', studentController.getAttendance);
router.get('/test', studentController.getTest);
router.post('/timetable', studentController.getTimetable);
router.get('/fee-status', studentController.getFeeStatus);
router.get('/batches', studentController.getbatches);
router.get('/profile', studentController.getProfile);

module.exports = router;