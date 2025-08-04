import express from 'express';
import { getOrganizer, registerOrganizer, loginOrganizer } from "../controllers/organizerController.js";

const router = express.Router();

router.get('/organizers', getOrganizer);
router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);

export default router;