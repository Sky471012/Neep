const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isStudent } = require('../middleware/authMiddleware');

router.use(verifyToken, isStudent);

router.get('/attendance', studentController.getAttendance);
router.get('/test', studentController.getTest);
router.get('/fee-status', studentController.getFeeStatus);
router.get('/batches', studentController.getbatches);

module.exports = router;