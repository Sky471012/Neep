const Popup = require("../models/Popup");

// GET current ad
exports.getPopup = async (req, res) => {
  try {
    const popup = await Popup.findOne();
  res.json(popup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST update ad
exports.updatePopup = async (req, res) => {
  try {
    const { description } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    let popup = await Popup.findOne();
    if (popup) {
      popup.imageUrl = imageUrl;
      popup.description = description;
    } else {
      popup = new Popup({ imageUrl, description });
    }

    await popup.save();
    res.status(200).json({ success: true, popup });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating popup.' });
  }
};