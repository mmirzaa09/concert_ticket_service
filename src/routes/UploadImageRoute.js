import express from 'express';
import {uploadImage} from '../controllers/uploadImageController.js';
import {upload} from '../middleware/UploadImageMiddleware.js';

const router = express.Router();

// Upload endpoint
router.post('/upload', upload.single('image'), uploadImage);

export default router;
