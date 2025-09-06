import * as response from '../utils/responseHandler.js';
import { getAllConcertsModel, postCreateConcertModel, getConcertByIdModel } from "../models/concertModel.js";
import { generateFileUrl } from "../models/uploadImageModel.js";

export const getConcertController = async (req, res) => {
    try {
        const concerts = await getAllConcertsModel();
        if (!concerts.length) {
            return response.success(res, 'No concerts found');
        }
        return response.success(res, 'concert fetch successfull', concerts);
    } catch (error) {
        return response.serverError(res, 'Failed to get concerts', error.message);
    }
};

export const createConcertController = async (req, res) => {

    try {
        const {
            title,
            artist,
            date,
            venue,
            price,
            description,
            total_tickets,
            id_organizer,
        } = req.body;

        // Handle image URL - either from uploaded file or provided URL
        let image_url = req.body.image_url || '';

        if (req.file) {
            // Generate proper URL for uploaded file
            image_url = generateFileUrl(req.file.path, req);
            console.log('Generated image URL:', image_url);
        }

        // Validate required fields
        if (!title || !artist || !date || !venue || !price || !description || !total_tickets || !id_organizer) {
            return response.badRequest(res, 'All fields are required: title, artist, date, venue, price, description, total_tickets, id_organizer');
        }

        // Validate image is provided
        if (!image_url) {
            return response.badRequest(res, 'Concert image is required. Either upload an image file or provide image_url');
        }

        // Create concert data with image URL
        const concertData = {
            title,
            artist,
            date,
            venue,
            price: parseFloat(price), // Convert to number
            description,
            total_tickets: parseInt(total_tickets), // Convert to number
            id_organizer: parseInt(id_organizer), // Convert to number
            image_url
        };

        // Save concert to database
        const concert = await postCreateConcertModel(concertData);

        return response.success(res, 'Concert created successfully', {
            concert,
        });
    } catch (error) {
        console.log('Error creating concert:', error);
        return response.serverError(res, error);
    }
};

export const getConcertIdController = async (req, res) => {
    try {
        const concert = await getConcertByIdModel(req.params.id);
        if (!concert) {
            return response.notFound(res, 'Concert not found');
        }
        return response.success(res, 'Concert fetch successful', concert);
    } catch (error) {
        console.log('Error fetching concert by ID:', error);
        return response.serverError(res, 'Failed to get concert', error.message);
    }
};
