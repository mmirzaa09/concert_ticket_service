import * as response from '../utils/responseHandler.js';
import {
    getAllTransactionsModel,
    getTransactionByIdModel,
    getTransactionsByOrderIdModel,
    getTransactionsByUserIdModel,
    createTransactionModel,
    updateTransactionModel,
    updateTransactionStatusModel,
    deleteTransactionModel,
    getTransactionStatsModel
} from "../models/transactionModel.js";
import { generateFileUrl } from "../models/uploadImageModel.js";

// Get all transactions
export const getAllTransactionsController = async (req, res) => {
    try {
        const transactions = await getAllTransactionsModel();
        if (!transactions.length) {
            return response.notFound(res, 'No transactions found');
        }

        return response.success(res, 'Transactions fetched successfully', transactions);
    } catch (error) {
        return response.serverError(res, 'Failed to get transactions', error.message);
    }
};

// Get transaction by ID
export const getTransactionByIdController = async (req, res) => {
    const { id_transaction } = req.params;

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    try {
        const transaction = await getTransactionByIdModel(id_transaction);
        return response.success(res, 'Transaction fetched successfully', transaction);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            return response.notFound(res, 'Transaction not found');
        }
        return response.serverError(res, 'Failed to get transaction', error.message);
    }
};

// Get transactions by order ID
export const getTransactionsByOrderIdController = async (req, res) => {
    const { id_order } = req.params;

    if (!id_order) {
        return response.badRequest(res, 'Order ID is required');
    }

    try {
        const transactions = await getTransactionsByOrderIdModel(id_order);
        if (!transactions.length) {
            return response.notFound(res, 'No transactions found for this order');
        }
        return response.success(res, 'Transactions fetched successfully', transactions);
    } catch (error) {
        return response.serverError(res, 'Failed to get transactions', error.message);
    }
};

// Get transactions by user ID
export const getTransactionsByUserIdController = async (req, res) => {
    const { id_user } = req.params;

    if (!id_user) {
        return response.badRequest(res, 'User ID is required');
    }

    try {
        const transactions = await getTransactionsByUserIdModel(id_user);
        if (!transactions.length) {
            return response.notFound(res, 'No transactions found for this user');
        }
        return response.success(res, 'Transactions fetched successfully', transactions);
    } catch (error) {
        return response.serverError(res, 'Failed to get transactions', error.message);
    }
};

// Create new transaction
export const createTransactionController = async (req, res) => {
    console.log('test')
    const { id_order } = req.body;

    if (!id_order) {
        return response.badRequest(res, 'Order ID is required');
    }

    // Handle payment proof image upload
    let payment_proof_url = req.body.payment_proof_url || "";

    if (req.file) {
        // Generate proper URL for uploaded payment proof
        payment_proof_url = generateFileUrl(req.file.path, req);
        console.log("Generated payment proof URL:", payment_proof_url);
    }

    const now = new Date();
    const paymentDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));

    const payload = {
        id_order,
        payment_proof_url,
        payment_date: paymentDate,
        transaction_status: 'pending'
    };

    try {
        const newTransaction = await createTransactionModel(payload);
        return response.created(res, 'Transaction created successfully', newTransaction);
    } catch (error) {
        if (error.message === 'Order not found') {
            return response.notFound(res, 'Order not found');
        }
        return response.serverError(res, 'Failed to create transaction', error.message);
    }
};

// Update transaction
export const updateTransactionController = async (req, res) => {
    const { id_transaction } = req.params;
    const { payment_date, transaction_status } = req.body;

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    // Handle payment proof image upload
    let payment_proof_url = req.body.payment_proof_url || null;

    if (req.file) {
        // Generate proper URL for uploaded payment proof
        payment_proof_url = generateFileUrl(req.file.path, req);
        console.log("Generated payment proof URL:", payment_proof_url);
    }

    // Validate transaction status if provided
    if (transaction_status) {
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
        if (!validStatuses.includes(transaction_status)) {
            return response.badRequest(res, 'Invalid transaction status. Valid statuses are: pending, completed, failed, cancelled');
        }
    }

    const payload = {
        payment_date,
        payment_proof_url,
        transaction_status
    };

    try {
        const updatedTransaction = await updateTransactionModel(id_transaction, payload);
        return response.success(res, 'Transaction updated successfully', updatedTransaction);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            return response.notFound(res, 'Transaction not found');
        }
        return response.serverError(res, 'Failed to update transaction', error.message);
    }
};

// Update transaction status only
export const updateTransactionStatusController = async (req, res) => {
    const { id_transaction } = req.params;
    const { transaction_status } = req.body;

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    if (!transaction_status) {
        return response.badRequest(res, 'Transaction status is required');
    }

    try {
        const updatedTransaction = await updateTransactionStatusModel(id_transaction, transaction_status);
        return response.success(res, 'Transaction status updated successfully', updatedTransaction);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            return response.notFound(res, 'Transaction not found');
        }
        if (error.message === 'Invalid transaction status') {
            return response.badRequest(res, 'Invalid transaction status. Valid statuses are: pending, completed, failed, cancelled');
        }
        return response.serverError(res, 'Failed to update transaction status', error.message);
    }
};

// Delete transaction
export const deleteTransactionController = async (req, res) => {
    const { id_transaction } = req.params;

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    try {
        const deletedTransaction = await deleteTransactionModel(id_transaction);
        return response.success(res, 'Transaction deleted successfully', deletedTransaction);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            return response.notFound(res, 'Transaction not found');
        }
        return response.serverError(res, 'Failed to delete transaction', error.message);
    }
};

// Get transaction statistics
export const getTransactionStatsController = async (req, res) => {
    try {
        const stats = await getTransactionStatsModel();
        return response.success(res, 'Transaction statistics fetched successfully', stats);
    } catch (error) {
        return response.serverError(res, 'Failed to get transaction statistics', error.message);
    }
};