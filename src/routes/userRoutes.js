import express from 'express';
import { getUser, registerUser, loginUser } from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/users', authenticateJWT, getUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;