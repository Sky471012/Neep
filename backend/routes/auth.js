const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const originMiddleware = require('../middleware/originMiddleware');

router.post('/login/student', originMiddleware, authController.loginStudent);
router.post('/login/admin-teacher/send-otp', originMiddleware, authController.sendOtp);
router.post('/login/admin-teacher/verify-otp', originMiddleware, authController.verifyOtp);
router.post("/switch-branch", originMiddleware, verifyToken, authController.switchBranch);
router.get("/me", verifyToken, authController.getSession);
router.post("/logout", originMiddleware, authController.logout);

module.exports = router;