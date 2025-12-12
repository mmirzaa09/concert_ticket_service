import express from 'express';
import { getOrganizerController, registerOrganizerController, loginOrganizerController, updateOrganizerStatusController } from "../controllers/organizerController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/organizers', authenticateJWT, getOrganizerController);
router.post('/register', registerOrganizerController);
router.post('/login', loginOrganizerController);
router.patch('/status/:id_organizer', authenticateJWT, updateOrganizerStatusController);

export default router;