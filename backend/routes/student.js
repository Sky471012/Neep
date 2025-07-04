const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.use(verifyToken, isStudent);

router.get('/', studentController.getStudent);
router.get('/attendance', studentController.getAttendance);
router.get('/fee-status', studentController.getFeeStatus);

module.exports = router;