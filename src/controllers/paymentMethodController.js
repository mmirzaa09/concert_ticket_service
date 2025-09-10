import * as response from '../utils/responseHandler.js';
import { getAllPaymentMethodsModel, postPaymentMethodModel } from "../models/paymentMethodModel.js";

export const getAllPaymentMethodsController = async (req, res) => {
    try {
        const paymentMethods = await getAllPaymentMethodsModel();
        if (!paymentMethods.length) {
            return response.notFound(res, 'No payment methods found');
        }

        return response.success(res, 'Payment methods fetched successfully', paymentMethods);
    } catch (error) {
        return response.serverError(res, 'Failed to get payment methods', error.message);
    }
};

export const createPaymentMethodController = async (req, res) => {
    try {
        const newPaymentMethod = await postPaymentMethodModel(req.body);
        return response.success(res, 'Payment method created successfully', newPaymentMethod);
    } catch (error) {
        return response.serverError(res, 'Failed to create payment method', error.message);
    }
};