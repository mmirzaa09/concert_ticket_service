import express from 'express';
import {
  getOrderController,
  getOrderByIdUserController,
  getOrderByIdController,
  createOrderController,
  getListOrderDetailController,
  getPaidOrderByIdController
} from "../controllers/orderController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.get('/',authenticateJWT, getOrderController);
router.get('/list', getListOrderDetailController);
router.get('/paid/:id_order', authenticateJWT, getPaidOrderByIdController);
router.get('/user/:id_user', authenticateJWT, getOrderByIdUserController);
router.get('/:id_order', authenticateJWT, getOrderByIdController);
router.post('/inquiry', authenticateJWT, createOrderController);

export default router;
