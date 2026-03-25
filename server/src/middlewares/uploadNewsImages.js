const multer = require("multer");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(new Error("Only image files are allowed."));
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 11, // 1 cover + 10 gallery
  },
  fileFilter,
});

module.exports = upload.fields([
  { name: "cover_image", maxCount: 1 },
  { name: "gallery_images", maxCount: 10 },
]);
