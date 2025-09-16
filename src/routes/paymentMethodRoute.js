import express from 'express';
import { getAllPaymentMethodsController, createPaymentMethodController, getPaymentMethodByIdController } from "../controllers/paymentMethodController.js";

const router = express.Router();

router.get('/', getAllPaymentMethodsController);
router.get('/:id', getPaymentMethodByIdController);
router.post('/', createPaymentMethodController);

export default router;
