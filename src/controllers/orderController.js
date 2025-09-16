import * as response from '../utils/responseHandler.js';
import { getAllOrderModel, getOrderByIdUserModel, postCreateOrderModel } from "../models/orderModel.js";
import { updateQuotaConcertController } from './concertController.js';

export const getOrderController = async (req, res) => {
    try {
        const orders = await getAllOrderModel();
        if (!orders.length) {
            return response.notFound(res, 'No orders found');
        }

        return response.success(res, 'Orders fetched successfully', orders);
    } catch (error) {
        return response.serverError(res, 'Failed to get orders', error.message);
    }
};

export const getOrderByIdUserController = async (req, res) => {
    const { id_user } = req.params;

    if (!id_user) {
        return response.badRequest(res, 'User ID is required');
    }

    try {
        const order = await getOrderByIdUserModel(id_user);
        return response.success(res, 'Order fetched successfully', order);
    } catch (error) {
        if (error === 'Order not found') {
            return response.notFound(res, 'Order not found');
        }
        return response.serverError(res, 'Failed to get order', error.message);
    }
};

export const createOrderController = async (req, res) => {
    const { id_user, id_concert, id_method, quantity, total_price } = req.body;

    if (!id_user || !id_concert || !id_method || !quantity || !total_price) {
        return response.badRequest(res, 'All fields are required');
    }

    const now = new Date();
    const indonesiaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const expirationDate = new Date(indonesiaTime.getTime() + (3 * 60 * 60 * 1000));
    const reservation_expired_calculated = expirationDate.toISOString();

    // Use calculated expiration if not provided
    const finalReservationExpired = reservation_expired_calculated;

    const payload = {
        id_user,
        id_concert,
        id_method,
        quantity,
        total_price,
        status: 'pending',
        reservation_expired: finalReservationExpired,
    }

    try {
        const newOrder = await postCreateOrderModel(payload);
        await updateQuotaConcertController(id_concert, quantity);
        return response.success(res, 'Order created successfully', newOrder);
    } catch (error) {
        if (error === 'User not found') {
            return response.notFound(res, 'User not found');
        }
        if (error === 'Concert not found') {
            return response.notFound(res, 'Concert not found');
        }
        if (error === 'Insufficient tickets available') {
            return response.badRequest(res, 'Insufficient tickets available');
        }
        return response.serverError(res, 'Failed to create order', error.message);
    }
};