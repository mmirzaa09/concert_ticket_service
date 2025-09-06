import * as response from '../utils/responseHandler.js';
import { getAllOrganizersModel, postRegisterOrganizerModel, postLoginOrganizerModel } from "../models/organizerModel.js";

export const getOrganizerController = async (req, res) => {
    try {
        const organizers = await getAllOrganizersModel();
        if (!organizers.length) {
            return response.notFound(res, 'No organizers found');
        }

        return response.success(res, 'Organizers fetched successfully', organizers);
    } catch (error) {
        return response.serverError(res, 'Failed to get organizers', error.message);
    }
};

export const registerOrganizerController = async (req, res) => {
    const { name, email, password, phone_number, address, role } = req.body;

    if (!name || !email || !password || !phone_number || !address) {
        return response.badRequest(res, 'All fields are required');
    }

    try {
        const newOrganizer = await postRegisterOrganizerModel({ name, email, password, phone_number, address, role });
        return response.success(res, 'Organizer registered successfully', newOrganizer);
    } catch (error) {
        return response.badRequest(res, 'Failed to register organizer', error);
    }
};

export const loginOrganizerController = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return response.badRequest(res, 'Email and password are required');
    }

    try {
        const organizer = await postLoginOrganizerModel(email, password);
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