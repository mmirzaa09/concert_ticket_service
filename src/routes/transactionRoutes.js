import express from 'express';
import {
    getAllTransactionsController,
    getTransactionByIdController,
    getTransactionsByOrderIdController,
    getTransactionsByUserIdController,
    createTransactionController,
    updateTransactionController,
    updateTransactionStatusController,
    deleteTransactionController,
    getTransactionStatsController
} from '../controllers/transactionController.js';
import { authenticateJWT } from '../middleware/jwtMiddleware.js';
import { upload } from '../middleware/UploadImageMiddleware.js';

const router = express.Router();

// GET routes
router.get('/', getAllTransactionsController);
router.get('/stats', getTransactionStatsController);
router.get('/:id_transaction', getTransactionByIdController);
router.get('/order/:id_order', getTransactionsByOrderIdController);
router.get('/user/:id_user', authenticateJWT, getTransactionsByUserIdController);

// POST routes
// router.post('/', upload.single('payment_proof'), authenticateJWT, createTransactionController);
router.post('/payment', upload.single('payment_proof'), createTransactionController);

// PUT routes
router.post('/confirm', authenticateJWT, updateTransactionStatusController);
router.post('/:id_transaction', upload.single('payment_proof'), authenticateJWT, updateTransactionController);

// DELETE routes
router.delete('/:id_transaction', authenticateJWT, deleteTransactionController);

export default router;