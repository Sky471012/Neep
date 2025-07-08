const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const popupController = require('../controllers/popupController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `ad_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.get('/getPopup', popupController.getPopup);
router.post('/uploadPopup', verifyToken, isAdmin, upload.single('image'), popupController.updatePopup);

module.exports = router;