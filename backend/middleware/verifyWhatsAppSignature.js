const crypto = require("crypto");

const verifyWhatsAppSignature = (
  req,
  res,
  next
) => {
  try {
    // ========================================
    // APP SECRET
    // ========================================

    const appSecret =
      process.env.META_APP_SECRET;

    if (!appSecret) {
      console.error(
        "META_APP_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "WhatsApp webhook security is not configured.",
      });
    }

    // ========================================
    // SIGNATURE HEADER
    // ========================================

    const signature =
      req.get(
        "X-Hub-Signature-256"
      );

    if (
      !signature ||
      !signature.startsWith(
        "sha256="
      )
    ) {
      console.warn(
        "WhatsApp webhook rejected: missing signature."
      );

      return res.sendStatus(401);
    }

    // ========================================
    // RAW BODY
    // ========================================

    if (
      !Buffer.isBuffer(
        req.rawBody
      )
    ) {
      console.error(
        "WhatsApp webhook raw body is unavailable."
      );

      return res.sendStatus(500);
    }

    // ========================================
    // CALCULATE EXPECTED SIGNATURE
    // ========================================

    const expectedSignature =
      "sha256=" +
      crypto
        .createHmac(
          "sha256",
          appSecret
        )
        .update(req.rawBody)
        .digest("hex");

    /*
      timingSafeEqual requires equal-length
      buffers. Check length before comparing.
    */

    const receivedBuffer =
      Buffer.from(
        signature,
        "utf8"
      );

    const expectedBuffer =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    if (
      receivedBuffer.length !==
      expectedBuffer.length
    ) {
      console.warn(
        "WhatsApp webhook rejected: invalid signature."
      );

      return res.sendStatus(401);
    }

    const valid =
      crypto.timingSafeEqual(
        receivedBuffer,
        expectedBuffer
      );

    if (!valid) {
      console.warn(
        "WhatsApp webhook rejected: invalid signature."
      );

      return res.sendStatus(401);
    }

    // ========================================
    // VERIFIED
    // ========================================

    next();
  } catch (error) {
    console.error(
      "WhatsApp webhook signature verification error:",
      error
    );

    return res.sendStatus(401);
  }
};

module.exports =
  verifyWhatsAppSignature;