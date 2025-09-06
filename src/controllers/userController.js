import { getAllUsersModel, postRegisterUserModel, postLoginUserModel } from '../models/userModel.js';
import * as response from '../utils/responseHandler.js';

export const getUserController = async (req, res) => {
    try {
        const users = await getAllUsersModel();
        if (!users.length) {
            return response.notFound(res, 'No users found');
        }

        return response.success(res, 'Users fetched successfully', users);
    } catch (error) {
        return response.serverError(res, 'Failed to get users', error.message);
    }
};

export const registerUserController = async (req, res) => {
    const { name, email, password, phone_number } = req.body;

    if (!name || !email || !password || !phone_number) {
        return response.badRequest(res, 'All fields are required');
    }

    try {
        const newUser = await postRegisterUserModel({ name, email, password, phone_number });
        return response.success(res, 'User registered successfully', newUser);
    } catch (error) {
        return response.badRequest(res, 'Failed to register user', error);
    }
};

export const loginUserController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return response.badRequest(res, 'Email and password are required');
    }
    try {
        const user = await postLoginUserModel(email, password);
        return response.success(res, 'User logged in successfully', user);
    } catch (error) {
        if (error.message === 'User not found') {
            return response.notFound(res, error.message);
        }

        if (error.message === 'Invalid credentials') {
            return response.unauthorized(res, error.message);
        }
        return response.serverError(res, error.message);
    }
}
