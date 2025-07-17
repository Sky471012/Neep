const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require("../middleware/upload");

router.use(verifyToken, isAdmin);

// Batch Management
router.get('/batches', adminController.getBatches);
router.get('/archivedBatches', adminController.getArchivedBatches);
router.get('/getBatchDetails/:batchId', adminController.getBatch);
router.get('/batchStudents/:batchId', adminController.getBatchStudents);
router.get('/batchTimetable/:batchId', adminController.getBatchTimetable);
router.get('/findTeacher/:batchId', adminController.getBatchTeacher);
router.get('/attendance/:studentId', adminController.getStudentsAttendance);
router.post('/attendance/mark', adminController.markAttendance);
router.post('/batchCreate', adminController.createBatch);
router.post('/updateTimetable/:batchId', adminController.updateTimetable);
router.delete('/batchDelete/:batchId', adminController.deleteBatch);
router.delete('/removeStudent', adminController.removeStudent);
router.post('/assignTeacher/:batchId/:teacherId', adminController.assignTeacher)
router.post('/addStudents', adminController.addStudentsToBatch);
router.post('/addStudentByCreating/:batchId', adminController.addStudentByCreating);
router.put('/:batchId/archive', adminController.toggleArchiveStatus);

// Student Management
router.get('/students', adminController.getStudents);
router.get('/getStudentDetails/:studentId', adminController.getStudent);
router.get('/studentBatches/:studentId', adminController.getStudentBatches);
router.get('/fee/:studentId', adminController.getStudentFee);
router.get('/installments/:studentId', adminController.getStudentInstallments);
router.post('/studentCreate', adminController.createStudent);
router.delete('/studentDelete/:studentId', adminController.deleteStudent);
router.post('/addStudent/:studentId/:batchId', adminController.addStudentToBatch);
router.patch('/fee/update-fee/:studentId', adminController.updateFee);
router.post('/fee/addInstallment', adminController.addInstallment);
router.delete('/fee/removeInstallment/:installmentId', adminController.removeInstallment);
router.patch('/fee/redistributeInstallment/:installmentId', adminController.redistributeInstallment);
router.post('/fee/createFeeWithInstallments', adminController.createFeeWithInstallments);
router.delete('/fee/deleteFeeStructure/:studentId', adminController.deleteFeeStructure);
router.patch("/fee/mark-paid/:id", adminController.markInstallmentPaid);
router.patch("/fee/updateInstallment/:id", adminController.updateInstallment);
router.post('/addBatches', adminController.addStudentToBatches);

// Teacher Management
router.get('/teachers', adminController.getTeachers);
router.get('/getTeacherDetails/:teacherId', adminController.getTeacher);
router.get('/teacherBatches/:teacherId', adminController.getTeacherBatches);
router.delete('/teacherDelete/:teacherId', adminController.deleteTeacher);
router.delete('/removeTeacher', adminController.removeTeacherFromBatch);


// Fee tracking
router.get('/fee/installments/unpaid', adminController.getUnpaidInstallments);
router.get('/fee/installments/upcoming', adminController.getUpcomingInstallments);
router.get('/fee/installments/paid', adminController.getPaidInstallments);

// Upload excel
router.post('/upload', upload.single("file"), adminController.uploadExcelSheet);

module.exports = router;