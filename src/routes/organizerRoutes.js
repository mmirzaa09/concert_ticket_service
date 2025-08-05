import express from 'express';
import { getOrganizer, registerOrganizer, loginOrganizer } from "../controllers/organizerController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/organizers', authenticateJWT, getOrganizer);
router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);

export default router;