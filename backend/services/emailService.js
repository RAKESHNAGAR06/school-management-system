const nodemailer = require(
  "nodemailer"
);

const createTransporter = () => {
  const host =
    process.env.EMAIL_HOST ||
    "smtp.gmail.com";

  const port = Number(
    process.env.EMAIL_PORT || 587
  );

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,

    auth: {
      user: process.env.EMAIL_USER,
      pass:
        process.env.EMAIL_PASSWORD,
    },
  });
};

const verifyEmailConnection =
  async () => {
    const transporter =
      createTransporter();

    await transporter.verify();

    console.log(
      "Email server connected successfully"
    );
  };

const sendEmail = async ({
  to,
  subject,
  text,
  html,
}) => {
  const transporter =
    createTransporter();

  const info =
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "School Management System"}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });

  return {
    success: true,
    messageId: info.messageId,
  };
};

module.exports = {
  sendEmail,
  verifyEmailConnection,
};