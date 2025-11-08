const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/login/student', authController.loginStudent);
router.post('/login/admin-teacher/send-otp', authController.sendOtp);
router.post('/login/admin-teacher/verify-otp', authController.verifyOtp);
router.post("/switch-branch", verifyToken, authController.switchBranch);

module.exports = router;