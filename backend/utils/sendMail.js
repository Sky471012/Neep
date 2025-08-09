const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendMail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
}

async function sendMailToAdmin(name, phone, email, message) {
  const mailOptions = {
    from: `"NEEP Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO_ADMIN,
    subject: "New Contact Form Submission",
    html: `
      <h3>Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendMail,
  sendMailToAdmin,
};
