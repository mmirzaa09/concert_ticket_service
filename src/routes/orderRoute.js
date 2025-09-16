import express from 'express';
import { getOrderController, getOrderByIdUserController, createOrderController } from '../controllers/orderController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/', getOrderController);
router.get('/:id_user', getOrderByIdUserController);
router.post('/inquiry', authenticateJWT, createOrderController);

export default router;
