const multer = require("multer");

const allowedMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.has(
      file.mimetype
    )
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
  storage:
    multer.memoryStorage(),

  fileFilter,

  limits: {
    fileSize:
      2 * 1024 * 1024,

    files: 1,
  },
});

module.exports = upload;