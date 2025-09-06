import express from 'express';
import { getConcertController, createConcertController, getConcertIdController } from '../controllers/concertController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';
import { upload } from '../middleware/UploadImageMiddleware.js';

const router = express.Router();
router.post('/create', upload.single('image'), createConcertController);
router.get('/', authenticateJWT, getConcertController);
router.get('/:id', authenticateJWT, getConcertIdController);

export default router;
