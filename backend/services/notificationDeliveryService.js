const SchoolSetting = require("../models/SchoolSetting");

const NotificationDelivery = require(
  "../models/NotificationDelivery"
);

const {
  sendWhatsAppMessage,
} = require("./whatsappService");

const {
  sendEmail,
} = require("./emailService");

const {
  resolveNotificationRecipients,
} = require("./notificationRecipientService");

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const sendNotificationEmails = async (
  notification
) => {
  if (!notification.channels?.email) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
    };
  }

  const recipients =
    await resolveNotificationRecipients(
      notification
    );

  let sent = 0;
  let failed = 0;

  for (const user of recipients) {
    if (!user.email) {
      continue;
    }

    const email = user.email
      .toLowerCase()
      .trim();

    let delivery;

    try {
      delivery =
        await NotificationDelivery.findOneAndUpdate(
          {
            notificationId: notification._id,
            userId: user._id,
            channel: "email",
          },
          {
            $setOnInsert: {
              recipient: email,
              status: "pending",
            },
          },
         {
		  returnDocument: "after",
		  upsert: true,
		}
        );

      /*
        Prevent accidental duplicate sends.
      */
      if (delivery.status === "sent") {
        continue;
      }

      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();

      await delivery.save();

      const result = await sendEmail({
        to: email,

        subject: notification.title,

        text: notification.message,

        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: auto;
            padding: 24px;
          ">
            <h2 style="margin-bottom:16px;">
              ${escapeHtml(notification.title)}
            </h2>

            <p style="
              line-height:1.7;
              color:#444;
              white-space:pre-line;
            ">
              ${escapeHtml(notification.message)}
            </p>

            <hr style="
              margin-top:24px;
              border:none;
              border-top:1px solid #eee;
            " />

            <p style="
              font-size:12px;
              color:#888;
            ">
              School Management System
            </p>
          </div>
        `,
      });

     delivery.status = "sent";

	delivery.providerMessageId =
	  result.messageId || "";

	delivery.error = "";
	delivery.sentAt = new Date();

	await delivery.save();


      sent++;
    } catch (error) {
      failed++;

      console.error(
        `Email failed for ${email}:`,
        error.message
      );

      if (delivery) {
        delivery.status = "failed";
        delivery.error = error.message;
        delivery.lastAttemptAt =
          new Date();

        await delivery.save();
      }
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
  };
};




const sendNotificationWhatsApps = async (notification) => {
  if (!notification.channels?.whatsapp) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };
  }

  const recipients =
    await resolveNotificationRecipients(notification);

  // School name from Settings
  const settings = await SchoolSetting.findOne();

  const schoolName =
    settings?.schoolName || "School Management System";

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const user of recipients) {
    if (!user.phone) {
      skipped++;
      continue;
    }

    const phone = String(user.phone).replace(/\D/g, "");

    if (!phone) {
      skipped++;
      continue;
    }

    let delivery = null;

    try {
      delivery =
        await NotificationDelivery.findOneAndUpdate(
          {
            notificationId: notification._id,
            userId: user._id,
            channel: "whatsapp",
          },
          {
            $set: {
              recipient: phone,
            },
            $setOnInsert: {
              status: "pending",
            },
          },
         {
		  returnDocument: "after",
		  upsert: true,
		}
        );

      // Prevent duplicate message
      if (
		  ["accepted", "sent", "delivered", "read"].includes(
			delivery.status
		  )
		) {
		  skipped++;
		  continue;
		}

      delivery.attempts += 1;
      delivery.lastAttemptAt = new Date();

      await delivery.save();

      const result = await sendWhatsAppMessage({
        to: phone,

        templateName: "school_notification",

        languageCode: "en",

        parameters: [
          user.name || "Student/Parent",
          notification.title || "School Notification",
          notification.message || "Please check the school portal.",
          schoolName,
        ],
      });

      delivery.status = "accepted";

		delivery.providerMessageId =
		  result.messageId || "";

		delivery.error = "";

		await delivery.save();

      sent++;
    } catch (error) {
      failed++;

      console.error(
        `WhatsApp delivery failed for ${phone}:`,
        error.message
      );

      if (delivery) {
        delivery.status = "failed";
        delivery.error = error.message;
        delivery.lastAttemptAt = new Date();

        await delivery.save();
      }
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
    skipped,
  };
};

module.exports = {
  sendNotificationEmails,
  sendNotificationWhatsApps,
};

