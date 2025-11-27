import express from 'express';
import {uploadImage, getImage} from '../controllers/uploadImageController.js';
import {upload} from '../middleware/UploadImageMiddleware.js';

const router = express.Router();

// Upload endpoint
router.post('/upload', upload.single('image'), uploadImage);

// Get image endpoint
router.get('/upload/:filename', getImage);

export default router;
