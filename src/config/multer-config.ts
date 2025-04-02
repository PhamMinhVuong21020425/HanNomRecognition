import fs from 'fs';
import multer from 'multer';

// Allowed file types
const ALLOWED_FILE_TYPES = [
  // Image types
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Annotation types
  'application/zip',
  'application/gzip',
  'application/x-tar',
  'application/json',
  'application/xml',
  'text/xml',
  'text/plain',
];

// File filter function
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Check file type
  if (ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only images and annotation files are allowed.'
      )
    );
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check and create uploads directory if it doesn't exist
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir); // Storage directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '$$' + file.originalname);
  },
});

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit
  },
});

export default upload;
