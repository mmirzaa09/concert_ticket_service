import * as response from '../utils/responseHandler.js';
import { getAllConcerts, postCreateConcert, getConcertById } from "../models/concertModel.js";

export const getConcert = async (req, res) => {
    try {
        const concerts = await getAllConcerts();
        if (!concerts.length) {
            return response.success(res, 'No concerts found');
        }
        return response.success(res, 'concert fetch successfull', concerts);
    } catch (error) {
        return response.serverError(res, 'Failed to get concerts', error.message);
    }
};

export const createConcert = async (req, res) => {
    try {
        const {
            title,
            artist,
            date,
            venue,
            price,
            image_url,
            description,
            total_tickets,
            id_organizer,
        } = req.body;

        if (!title || !artist || !date || !venue || !price || !image_url || !description || !total_tickets || !id_organizer) {
            return response.badRequest(res, 'All fields are required');
        }

        const concert = await postCreateConcert(req.body);
        return response.success(res, 'Concert created successfully', concert);
    } catch (error) {
        console.log('Error creating concert:', error);
        return response.serverError(res, error);
    }
};

export const getConcertId = async (req, res) => {
    try {
        const concert = await getConcertById(req.params.id);
        if (!concert) {
            return response.notFound(res, 'Concert not found');
        }
        return response.success(res, 'Concert fetch successful', concert);
    } catch (error) {
        console.log('Error fetching concert by ID:', error);
        return response.serverError(res, 'Failed to get concert', error.message);
    }
};
