import multer from 'multer';
import {getUploadPath, generateFileName, isValidImageType} from '../models/uploadImageModel.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Get userId from request body or headers if available
    const userId = req.body.userId || req.headers['user-id'] || null;
    
    // Create upload path (returns absolute path for file storage)
    const uploadPath = getUploadPath(userId);

    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const customName = req.body.fileName || 'image';
    const filename = generateFileName(file.originalname, customName);
    cb(null, filename);
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  if (isValidImageType(file)) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,  // Remove the () - storage is already a function
  fileFilter: fileFilter,  // Remove the () - fileFilter is already a function
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});