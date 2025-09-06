import express from 'express';
import { getOrganizerController, registerOrganizerController, loginOrganizerController } from "../controllers/organizerController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/organizers', authenticateJWT, getOrganizerController);
router.post('/register', registerOrganizerController);
router.post('/login', loginOrganizerController);

export default router;