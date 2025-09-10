import express from 'express';
import { getOrderController, getOrderByIdUserController, createOrderController } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrderController);
router.get('/:id_user', getOrderByIdUserController);
router.post('/inquiry', createOrderController);

export default router;
