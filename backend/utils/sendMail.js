const nodemailer = require("nodemailer");
const axios = require("axios");

async function sendMail(to, subject, text, senderEmail) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "NEEP", email: senderEmail }, // dynamic sender
        to: [{ email: to }],
        subject: subject,
        textContent: text,
      },
      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error(
      "Email sending failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function sendMailToAdmin(name, phone, email, message) {
  return sendMail(
    process.env.EMAIL_TO_ADMIN,
    "New Contact Form Submission",
    `New contact message from ${name}. \n\nContact Number: ${phone}, \nEmail: ${email}\n\nMessage:\n${message}`,
    process.env.EMAIL_USER_CONTACT
  );
}

module.exports = {
  sendMail,
  sendMailToAdmin,
};
