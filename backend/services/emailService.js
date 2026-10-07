const { Resend } = require("resend");

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(apiKey);
};

const verifyEmailConnection = async () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  console.log("Email API configured successfully");
};

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  if (!to) {
    throw new Error("Email recipient is required");
  }

  const resend = getResendClient();

  const from =
    process.env.EMAIL_FROM ||
    "School Management System <onboarding@resend.dev>";

  const { data, error } =
    await resend.emails.send({
      from,
      to,
      subject,
      ...(text ? { text } : {}),
      ...(html ? { html } : {}),
    });

  if (error) {
    throw new Error(
      error.message || "Email sending failed"
    );
  }

  return {
    success: true,
    messageId: data?.id || null,
  };
};

module.exports = {
  sendEmail,
  verifyEmailConnection,
};