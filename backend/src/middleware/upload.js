const multer = require("multer");

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const allowed = ["text/plain", "text/markdown", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only TXT, Markdown and PDF files are allowed"));
    }
    cb(null, true);
  }
});
