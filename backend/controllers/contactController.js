const {sendMailToAdmin} = require("../utils/sendMail");

exports.handleContactForm = async (req, res, next) => {
  const { name, phone, email, message } = req.body;

  try {
    await sendMailToAdmin(name, phone, email, message);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    next(error); // pass error to middleware
  }
};
