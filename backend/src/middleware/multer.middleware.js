import multer from "multer";
import path from "path";

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Thư mục lưu file tạm thời
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Định dạng tên file
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const validFormats = /mp3|wav|flac|m4a|jpg|jpeg|png|opus/;
  const mimeType = validFormats.test(file.mimetype);
  const extName = validFormats.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file format"));
  }
};

// Tạo middleware Multer
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Giới hạn kích thước file (50MB)
  fileFilter,
});

export default upload;
