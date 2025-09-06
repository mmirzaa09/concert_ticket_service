import * as response from '../utils/responseHandler.js';
import { getAllOrganizers, postRegisterOrganizer, postLoginOrganizer } from "../models/organizerModel.js";

export const getOrganizer = async (req, res) => {
    try {
        const organizers = await getAllOrganizers();
        if (!organizers.length) {
            return response.notFound(res, 'No organizers found');
        }

        return response.success(res, 'Organizers fetched successfully', organizers);
    } catch (error) {
        return response.serverError(res, 'Failed to get organizers', error.message);
    }
};

export const registerOrganizer = async (req, res) => {
    const { name, email, password, phone_number, address, role } = req.body;

    if (!name || !email || !password || !phone_number || !address) {
        return response.badRequest(res, 'All fields are required');
    }

    try {
        const newOrganizer = await postRegisterOrganizer({ name, email, password, phone_number, address, role });
        return response.success(res, 'Organizer registered successfully', newOrganizer);
    } catch (error) {
        return response.badRequest(res, 'Failed to register organizer', error);
    }
};

export const loginOrganizer = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return response.badRequest(res, 'Email and password are required');
    }

    try {
        const organizer = await postLoginOrganizer(email, password);
        return response.success(res, 'Organizer logged in successfully', organizer);
    } catch (error) {

        if (error === 'Organizer not found') {
            return response.notFound(res, 'Organizer not found');
        }

        if (error === 'Invalid credentials') {
            return response.unauthorized(res, 'Invalid credentials');
        }

        return response.serverError(res, error.message);
    }
};