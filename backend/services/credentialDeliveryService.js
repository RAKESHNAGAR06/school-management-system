const {
  sendEmail,
} = require("./emailService");

const {
  sendWhatsAppMessage,
} = require("./whatsappService");


// ==========================================
// ESCAPE HTML
// ==========================================

const escapeHtml = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// ==========================================
// NORMALIZE INDIAN WHATSAPP NUMBER
// ==========================================

const normalizeWhatsAppNumber = (phone) => {
  const digits = String(phone || "").replace(
    /\D/g,
    ""
  );

  if (!digits) {
    return "";
  }

  // 10 digit Indian mobile number
  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
};

// ==========================================
// SEND LOGIN CREDENTIALS
// ==========================================

const sendLoginCredentials = async ({
  name,
  email,
  phone,
  role,
  temporaryPassword,
}) => {
  const result = {
    email: {
      attempted: false,
      success: false,
      error: null,
    },

    whatsapp: {
      attempted: false,
      success: false,
      error: null,
    },
  };

  const cleanName =
    String(name || "").trim() || "User";

  const cleanEmail = String(email || "")
    .trim()
    .toLowerCase();

  const cleanRole =
    String(role || "user").trim();
	
  const safeName =
  escapeHtml(cleanName);

const safeEmail =
  escapeHtml(cleanEmail);

const safeRole =
  escapeHtml(cleanRole);

const safeTemporaryPassword =
  escapeHtml(
    temporaryPassword || ""
  );	

  // ==========================================
  // EMAIL
  // ==========================================

  if (cleanEmail) {
    result.email.attempted = true;

    try {
      await sendEmail({
        to: cleanEmail,

        subject:
          "Your School Management System Login Credentials",

        text: `
Hello ${cleanName},

Your ${cleanRole} account has been created successfully.

Login Email: ${cleanEmail}
Temporary Password: ${temporaryPassword}

For security, please change your password after your first login.

Regards,
School Management System
        `.trim(),

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: auto;
              padding: 24px;
              color: #1f2937;
            "
          >
            <h2>
              Welcome to School Management System
            </h2>

            <p>
              Hello <strong>${safeName}</strong>,
            </p>

            <p>
              Your <strong>${safeRole}</strong>
              account has been created successfully.
            </p>

            <div
              style="
                background: #f3f4f6;
                padding: 18px;
                border-radius: 8px;
                margin: 20px 0;
              "
            >
              <p>
                <strong>Login Email:</strong>
                ${safeEmail}
              </p>

              <p>
                <strong>Temporary Password:</strong>
                ${safeTemporaryPassword}
              </p>
            </div>

            <p>
              For security, please change your
              password after your first login.
            </p>

            <p>
              Regards,<br />
              School Management System
            </p>
          </div>
        `,
      });

      result.email.success = true;
    } catch (error) {
  console.error(
    "Credential email delivery failed"
  );

  result.email.error =
    "Email delivery failed";
}
  }

  // ==========================================
  // WHATSAPP
  // ==========================================

  const whatsappNumber =
    normalizeWhatsAppNumber(phone);

  if (whatsappNumber) {
    result.whatsapp.attempted = true;

    try {
      /*
        Existing approved template:
        school_notification

        We are sending credential information
        through the existing template parameters.

        IMPORTANT:
        Parameter count must match the approved
        Meta template.
      */

      await sendWhatsAppMessage({
        to: whatsappNumber,

        templateName:
          "school_notification",

        languageCode: "en",

        parameters: [
          "Login Credentials",

          `${cleanName}, your ${cleanRole} account has been created. Login Email: ${cleanEmail}. Temporary Password: ${temporaryPassword}. Please change your password after first login.`,
        ],
      });

      result.whatsapp.success = true;
   } catch (error) {
  console.error(
    "Credential WhatsApp delivery failed"
  );

  result.whatsapp.error =
    "WhatsApp delivery failed";
}
  }

  return result;
};

module.exports = {
  sendLoginCredentials,
};