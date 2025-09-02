import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const baseUploadDir = 'uploadImage';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the project root directory (go up two levels from src/models/)
const projectRoot = path.join(__dirname, '..', '..');

const ensureBaseDirectory = () => {
  const uploadDir = path.join(projectRoot, baseUploadDir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const createUserDirectory = (userId) => {
  const baseDir = ensureBaseDirectory();
  const userDir = path.join(baseDir, userId.toString());
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }
  return userDir;
};

const createDateDirectory = (basePath) => {
  const dateFolder = new Date().toISOString().split('T')[0];
  const datePath = path.join(basePath, dateFolder);
  if (!fs.existsSync(datePath)) {
    fs.mkdirSync(datePath, { recursive: true });
  }
  return datePath;
};

export const getFileUrl = (filePath, host, port) => {
  // Convert absolute path to relative path from project root
  let relativePath = path.relative(projectRoot, filePath);
  
  // Replace uploadImage with uploads in the URL
  const urlPath = relativePath.replace(/\\/g, '/').replace('uploadImage/', '');
  
  return `http://${host}:${port}/uploads/${urlPath}`;
};

export const isValidImageType = (file) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    return mimetype && extname;
};

export const generateFileName = (originalName, customName) => {
  const name = customName || 'image';
  const timestamp = Date.now();
  const extension = path.extname(originalName);
  return `${name}_${timestamp}${extension}`;
};

export const getUploadPath = (userId = null) => {
  if (userId) {
    const userDir = createUserDirectory(userId);
    return createDateDirectory(userDir);
  } else {
    const baseDir = ensureBaseDirectory();
    return createDateDirectory(baseDir);
  }
};

// Helper function to get relative path for database storage
export const getRelativePath = (absolutePath) => {
  return path.relative(projectRoot, absolutePath);
};

// Helper function to convert relative path back to absolute
export const getAbsolutePath = (relativePath) => {
  return path.join(projectRoot, relativePath);
};

// Generate proper URL from file path
export const generateFileUrl = (filePath, req) => {
  const host = req.get('host') || 'localhost:3030';
  const protocol = req.protocol || 'http';
  
  // Get relative path from project root
  const relativePath = getRelativePath(filePath);
  
  // Replace uploadImage with uploads and normalize slashes
  const urlPath = relativePath.replace(/\\/g, '/').replace('uploadImage/', '');
  
  return `${protocol}://${host}/uploads/${urlPath}`;
};