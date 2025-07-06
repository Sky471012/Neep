const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken, isAdmin);

// Batch Management
router.get('/batches', adminController.getBatches);
router.post('/batch', adminController.createBatch);
router.delete('/batch/:id', adminController.deleteBatch);

// Student Management
router.post('/batch/:batchId/student', adminController.addStudentToBatch);
router.delete('/batch/:batchId/student/:studentId', adminController.removeStudentFromBatch);

// Attendance & Fee
router.post('/attendance/mark', adminController.markAttendance);
router.post('/fee-status/update', adminController.updateFeeStatus);

module.exports = router;