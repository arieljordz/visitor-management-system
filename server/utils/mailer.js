import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

// Check for required credentials
if (!user || !pass) {
  throw new Error("Missing email credentials (EMAIL_USER or EMAIL_PASS)");
}

// Create the transporter
export const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user,
    pass,
  },
});

// Reusable email sending function
export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Visitor Management System" <${user}>`,
    to,
    subject,
    html,
  });
};
