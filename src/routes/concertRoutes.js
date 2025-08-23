import express from 'express';
import { getConcert, createConcert, getConcertId } from '../controllers/concertController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.post('/create', createConcert);
router.get('/', authenticateJWT, getConcert);
router.get('/:id', authenticateJWT, getConcertId);

export default router;
