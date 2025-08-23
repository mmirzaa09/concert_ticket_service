import express from 'express';
import { getConcert, createConcert } from '../controllers/concertController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/', authenticateJWT, getConcert);
router.post('/create', createConcert);

export default router;
