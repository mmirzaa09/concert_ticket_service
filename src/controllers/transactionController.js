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
import { updateOrderStatusModel } from "../models/orderModel.js";
import { supabase } from '../utils/supabase.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdef', 10);

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
    const { id_order, id_user } = req.body;

    if (!id_order) {
        return response.badRequest(res, 'Order ID is required');
    }

    let payment_proof_url = req.body.payment_proof_url || "";

    if (req.file) {
        const filename = `${nanoid()}-${req.file.originalname}`;
      
        // Upload file to Supabase
        const { data, error } = await supabase.storage
            .from('images') 
            .upload(filename, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: false,
            });

        if (error) {
            throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('images')
            .getPublicUrl(data.path);

        payment_proof_url = publicUrlData.publicUrl;
    }

    const now = new Date();
    const paymentDate = new Date(now.getTime() + (7 * 60 * 60 * 1000));

    const payload = {
        id_order,
        id_user,
        payment_proof_url,
        payment_date: paymentDate,
        transaction_status: 'pending'
    };

    try {
        const newTransaction = await createTransactionModel(payload);
        await updateOrderStatusModel(id_order, 'waiting_confirmation');
        return response.created(res, 'Transaction created successfully and order status updated to waiting confirmation', newTransaction);
    } catch (error) {
        if (error.message === 'Order not found') {
            return response.notFound(res, 'Order not found');
        }
        return response.serverError(res, 'Failed to create transaction', error.message);
    }
};

// Update transaction
export const updateTransactionController = async (req, res) => {
    console.log('updateTransactionController')
    const { id_transaction, transaction_status } = req.body;    

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    // Validate transaction status if provided
    if (transaction_status) {
        const validStatuses = ['pending', 'completed', 'failed', 'cancelled', 'rejected'];
        if (!validStatuses.includes(transaction_status)) {
            return response.badRequest(res, 'Invalid transaction status. Valid statuses are: pending, completed, failed, cancelled, rejected');
        }
    }

    const payload = {
        id_transaction,
        transaction_status
    };

    try {
        const updatedTransaction = await updateTransactionModel(payload);

        // Fetch the updated transaction with all details to get the order ID
        const transactionWithDetails = await getTransactionByIdModel(id_transaction);

        // If transaction status is updated, update the corresponding order status
        if (transactionWithDetails && transaction_status) {
            const orderId = transactionWithDetails.id_order;
            let newOrderStatus = null;

            if (transaction_status === 'completed') {
                newOrderStatus = 'paid';
            } else if (transaction_status === 'failed') {
                newOrderStatus = 'failed';
            } else if (transaction_status === 'cancelled') {
                newOrderStatus = 'cancelled';
            }

            if (newOrderStatus) {
                await updateOrderStatusModel(orderId, newOrderStatus);
            }
        }

        return response.success(res, 'Transaction and order status updated successfully', transactionWithDetails);
    } catch (error) {
        if (error.message === 'Transaction not found') {
            return response.notFound(res, 'Transaction not found');
        }
        return response.serverError(res, 'Failed to update transaction', error.message);
    }
};

// Update transaction status only
export const updateTransactionStatusController = async (req, res) => {
    const { transaction_status, id_transaction } = req.body;

    if (!id_transaction) {
        return response.badRequest(res, 'Transaction ID is required');
    }

    if (!transaction_status) {
        return response.badRequest(res, 'Transaction status is required');
    }

    try {
        const updatedTransaction = await updateTransactionStatusModel(id_transaction, transaction_status);
        const transactionWithDetails = await getTransactionByIdModel(id_transaction);
        const orderId = transactionWithDetails.id_order;
        await updateOrderStatusModel(orderId, transaction_status);
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