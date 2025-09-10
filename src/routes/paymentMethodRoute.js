import express from 'express';
import { getAllPaymentMethodsController, createPaymentMethodController } from "../controllers/paymentMethodController.js";

const router = express.Router();

router.get('/', getAllPaymentMethodsController);
router.post('/', createPaymentMethodController);

export default router;
