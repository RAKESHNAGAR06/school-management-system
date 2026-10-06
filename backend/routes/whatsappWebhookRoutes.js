const express = require("express");

const NotificationDelivery = require(
  "../models/NotificationDelivery"
);
const verifyWhatsAppSignature =
  require(
    "../middleware/verifyWhatsAppSignature"
  );

const router = express.Router();


// ======================================
// META WEBHOOK VERIFICATION
// ======================================
router.get("/", (req, res) => {
  const mode =
    req.query["hub.mode"];

  const token =
    req.query["hub.verify_token"];

  const challenge =
    req.query["hub.challenge"];

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (
    mode === "subscribe" &&
    token === verifyToken
  ) {
    console.log(
      "WhatsApp webhook verified successfully"
    );

    return res
      .status(200)
      .send(challenge);
  }

  return res.sendStatus(403);
});


// ======================================
// WHATSAPP STATUS WEBHOOK
// ======================================
router.post(
  "/",
  verifyWhatsAppSignature,
  async (req, res) => {
    try {
      const entries =
        req.body?.entry || [];

      for (const entry of entries) {
        const changes =
          entry?.changes || [];

        for (const change of changes) {
          const statuses =
            change?.value
              ?.statuses || [];

          for (
            const statusData
            of statuses
          ) {
            const messageId =
              statusData?.id;

            const status =
              statusData?.status;

            if (
              !messageId ||
              !status
            ) {
              continue;
            }

            const delivery =
              await NotificationDelivery.findOne(
                {
                  channel:
                    "whatsapp",

                  providerMessageId:
                    messageId,
                }
              );

            if (!delivery) {
              continue;
            }

            if (
              status === "sent"
            ) {
              delivery.status =
                "sent";

              if (
                !delivery.sentAt
              ) {
                delivery.sentAt =
                  new Date();
              }
            } else if (
              status ===
              "delivered"
            ) {
              delivery.status =
                "delivered";

              if (
                !delivery.sentAt
              ) {
                delivery.sentAt =
                  new Date();
              }

              delivery.deliveredAt =
                new Date();
            } else if (
              status === "read"
            ) {
              delivery.status =
                "read";

              if (
                !delivery.sentAt
              ) {
                delivery.sentAt =
                  new Date();
              }

              if (
                !delivery.deliveredAt
              ) {
                delivery.deliveredAt =
                  new Date();
              }

              delivery.readAt =
                new Date();
            } else if (
              status === "failed"
            ) {
              delivery.status =
                "failed";

              const errors =
                statusData?.errors ||
                [];

              delivery.error =
                errors
                  .map((item) =>
                    [
                      item?.title,
                      item?.message,
                      item?.error_data
                        ?.details,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(" - ")
                  )
                  .filter(Boolean)
                  .join(" | ") ||
                "WhatsApp delivery failed";
            }

            await delivery.save();
          }
        }
      }

      return res.sendStatus(
        200
      );
    } catch (error) {
      console.error(
        "WhatsApp webhook processing failed"
      );

      /*
        Return 200 so Meta does not repeatedly
        retry a malformed/unprocessable event.

        Invalid signatures never reach here;
        signature middleware rejects them first.
      */

      return res.sendStatus(
        200
      );
    }
  }
);


module.exports = router;