const sanitizeTemplateText = (
  value = ""
) => {
  return String(value)
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
};

const sendWhatsAppMessage = async ({
  to,
  templateName = "school_notification",
  languageCode = "en",
  parameters = [],
}) => {
  const accessToken =
    process.env.WHATSAPP_ACCESS_TOKEN;

  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID;

  const apiVersion =
    process.env.WHATSAPP_API_VERSION;

  if (
    !accessToken ||
    !phoneNumberId ||
    !apiVersion
  ) {
    throw new Error(
      "WhatsApp service is not configured"
    );
  }

  const recipient = String(
    to || ""
  ).replace(/\D/g, "");

  if (!recipient) {
    throw new Error(
      "WhatsApp recipient number is required"
    );
  }

  const url =
    `https://graph.facebook.com/${apiVersion}` +
    `/${phoneNumberId}/messages`;

  const bodyParameters =
    parameters.map((value) => ({
      type: "text",

      text: sanitizeTemplateText(
        value || "-"
      ),
    }));

  const requestBody = {
    messaging_product: "whatsapp",
    to: recipient,
    type: "template",

    template: {
      name: templateName,

      language: {
        code: languageCode,
      },

      components: [
        {
          type: "body",
          parameters:
            bodyParameters,
        },
      ],
    },
  };

  let response;

  try {
    response = await fetch(url, {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${accessToken}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(
        requestBody
      ),
    });
  } catch (error) {
    console.error(
      "WhatsApp network request failed"
    );

    throw new Error(
      "Unable to connect to WhatsApp service"
    );
  }

  let data = {};

  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    const metaError =
      data?.error;

    console.error(
      "WhatsApp API request failed:",
      {
        status:
          response.status,

        code:
          metaError?.code ||
          null,

        subcode:
          metaError
            ?.error_subcode ||
          null,

        type:
          metaError?.type ||
          null,
      }
    );

    throw new Error(
      "WhatsApp message delivery failed"
    );
  }

  return {
    success: true,

    messageId:
      data?.messages?.[0]?.id ||
      "",
  };
};

module.exports = {
  sendWhatsAppMessage,
};