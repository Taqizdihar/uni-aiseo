require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 2525,
  secure: false, // Brevo uses STARTTLS on port 587/2525
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function test() {
  try {
    const info = await transporter.sendMail({
      from: `"UNI-AISEO Team" <${process.env.EMAIL_FROM}>`,
      to: "test@example.com", // Brevo won't send it if domain is unverified, let's see the error
      subject: "Test Email from Node.js",
      text: "This is a test email.",
    });
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    
    // Also try another one with SMTP_USER as the sender, which is verified for sure.
    const info2 = await transporter.sendMail({
      from: `"UNI-AISEO Team" <${process.env.SMTP_USER}>`,
      to: "test2@example.com", 
      subject: "Test Email from Node.js (Verified Sender)",
      text: "This is a test email with verified sender.",
    });
    console.log("Email 2 sent successfully!");
    console.log("Message ID:", info2.messageId);
    console.log("Response:", info2.response);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

test();
