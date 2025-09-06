import express from 'express';
import { getUserController, registerUserController, loginUserController } from '../controllers/userController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/users', authenticateJWT, getUserController);
router.post('/register', registerUserController);
router.post('/login', loginUserController);

export default router;