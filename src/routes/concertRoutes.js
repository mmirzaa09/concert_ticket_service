import express from 'express';
import {
  getConcertController,
  createConcertController,
  getConcertIdController,
  getConcertByOrganizerController,
  updateConcertStatusController,
  deleteConcertController,
} from "../controllers/concertController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js';
import { upload } from '../middleware/UploadImageMiddleware.js';

const router = express.Router();
router.get('/', authenticateJWT, getConcertController);
router.post('/create', authenticateJWT, upload.single('image'), createConcertController);
router.get('/organizer/:id_organizer', authenticateJWT, getConcertByOrganizerController);
router.get('/detail/:id', authenticateJWT, getConcertIdController);
router.patch('/status/:id', authenticateJWT, updateConcertStatusController);
router.delete('/delete/:id', authenticateJWT, deleteConcertController);

export default router;
