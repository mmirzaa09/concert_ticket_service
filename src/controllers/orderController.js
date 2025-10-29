import * as response from '../utils/responseHandler.js';
import {
  getAllOrderModel,
  getOrderByIdUserModel,
  getOrderByIdModel,
  postCreateOrderModel,
  updateOrderStatusModel,
  getListOrderDetailModel,
  getPaidOrderByIdModel,
} from "../models/orderModel.js";
import { updateQuotaConcertController } from './concertController.js';
import { restoreTicketsModel } from '../models/concertModel.js';

export const getOrderController = async (req, res) => {
    try {
        const orders = await getAllOrderModel();
        if (!orders.length) {
            return response.notFound(res, 'No orders found');
        }

        const data = {
            'orders': orders,
            'totalOrders': orders.length
        }

        return response.success(res, 'Orders fetched successfully', data);
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
        let orders = await getOrderByIdUserModel(id_user);

        const now = new Date();
        const expiredOrders = orders.filter(order => new Date(order.reservation_expired) < now && order.status === 'pending');

        if (expiredOrders.length > 0) {
            const updatePromises = expiredOrders.map(async (order) => {
                await updateOrderStatusModel(order.id_order, 'cancelled');
                await restoreTicketsModel(order.concert.id_concert, order.quantity);
                
                return order;
            });
            
            await Promise.all(updatePromises);

            orders = await getOrderByIdUserModel(id_user);
        }

        return response.success(res, 'Orders fetched successfully', orders);
    } catch (error) {
        if (error.message === 'Orders not found for this user' || error === 'Order not found') {
            return response.notFound(res, 'No orders found for this user');
        }
        return response.serverError(res, 'Failed to get orders', error.message);
    }
};

export const getOrderByIdController = async (req, res) => {
    const { id_order } = req.params;

    if (!id_order) {
        return response.badRequest(res, 'Order ID is required');
    }

    try {
        const order = await getOrderByIdModel(id_order);
        return response.success(res, 'Order fetched successfully', order);
    } catch (error) {
        if (error.message === 'Order not found') {
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

export const getListOrderDetailController = async (req, res) => {
    try {
        const orderDetails = await getListOrderDetailModel();
        const data = {
            'listOrder': orderDetails,
            'totalOrder': orderDetails.length
        };
        return response.success(res, 'Order details fetched successfully', data);
    } catch (error) {
        if (error.message === 'No orders found') {
            return response.notFound(res, 'No orders found');
        }
        return response.serverError(res, 'Failed to get order details', error.message);
    }
};

export const getPaidOrderByIdController = async (req, res) => {
    const { id_order } = req.params;
    
    try {
        const paidOrder = await getPaidOrderByIdModel(id_order);
        return response.success(res, 'Paid order fetched successfully', paidOrder);
    } catch (error) {
        if (error.message === 'Paid order not found with this ID') {
            return response.notFound(res, error.message);
        }
        return response.serverError(res, 'Failed to get paid order', error.message);
    }
};