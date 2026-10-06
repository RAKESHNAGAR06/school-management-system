const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const uploadDirectory = path.join(
  __dirname,
  "../uploads"
);

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const allowedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(null, uploadDirectory);
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const extension =
      path
        .extname(file.originalname)
        .toLowerCase();

    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  const extension =
    path
      .extname(file.originalname)
      .toLowerCase();

  const validMimeType =
    allowedMimeTypes.has(
      file.mimetype
    );

  const validExtension =
    allowedExtensions.has(
      extension
    );

  if (
    validMimeType &&
    validExtension
  ) {
    return cb(null, true);
  }

  return cb(
    new multer.MulterError(
      "LIMIT_UNEXPECTED_FILE",
      "logo"
    )
  );
};

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      2 * 1024 * 1024,

    files: 1,
  },
});

module.exports = upload;