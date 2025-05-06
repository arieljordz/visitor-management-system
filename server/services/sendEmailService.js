import { sendEmail } from "../utils/mailer.js";

export const sendVerificationEmail = async ({ name, email }) => {
  const verificationUrl = `${process.env.BASE_API_URL}/api/google-login-verify-user?email=${encodeURIComponent(email)}`;
  const subject = "Verify Your Email";

  const message = `
    <div>
      <p>Hello ${name},</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p>
        <a href="${verificationUrl}" style="color: #1a73e8; text-decoration: underline;" target="_blank" rel="noopener noreferrer">
          Verify Email
        </a>
      </p>
      <p>Or copy and paste the link into your browser:</p>
      <p style="word-break: break-all;">${verificationUrl}</p>
      <p><strong>Note:</strong> Your default password is: <code>DefaultPass123!</code></p>
      <p>You can change your password after logging in.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html: message });
};
