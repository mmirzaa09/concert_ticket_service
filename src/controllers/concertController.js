import * as response from "../utils/responseHandler.js";
import {
  getAllConcertsModel,
  postCreateConcertModel,
  getConcertByIdModel,
  updateConcertQuotaModel,
  getConcertByOrganizerModel,
  updateConcertStatusModel,
  deleteConcertModel,
} from "../models/concertModel.js";
import { supabase } from '../utils/supabase.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdef', 10);

export const getConcertController = async (req, res) => {
  try {
    const concerts = await getAllConcertsModel();
    if (!concerts.length) {
      return response.success(res, "No concerts found");
    }
    return response.success(res, "concert fetch successfull", concerts);
  } catch (error) {
    return response.serverError(res, "Failed to get concerts", error.message);
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

    let image = null;
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

      image = publicUrlData.publicUrl;
    }

    // Validate required fields
    if (
      !title ||
      !artist ||
      !date ||
      !venue ||
      !price ||
      !description ||
      !total_tickets ||
      !id_organizer ||
      !image // Also validate image_url
    ) {
      return response.badRequest(
        res,
        "All fields are required: title, artist, date, venue, price, description, total_tickets, id_organizer, image"
      );
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
      image,
    };

    // Save concert to database
    const concert = await postCreateConcertModel(concertData);

    return response.success(res, "Concert created successfully", {
      concert,
    });
  } catch (error) {
    console.log("Error creating concert:", error);
    return response.serverError(res, "Failed to create concert", error.message);
  }
};

export const getConcertIdController = async (req, res) => {
  try {
    const concert = await getConcertByIdModel(req.params.id);
    if (!concert) {
      return response.notFound(res, "Concert not found");
    }
    return response.success(res, "Concert fetch successful", concert);
  } catch (error) {
    console.log("Error fetching concert by ID:", error);
    return response.serverError(res, "Failed to get concert", error.message);
  }
};

export const updateQuotaConcertController = async (id_concert, quantity) => {
  try {
    const updatedConcert = await updateConcertQuotaModel(id_concert, quantity);
    return updatedConcert;
  } catch (error) {
    throw error;
  }
};

export const getConcertByOrganizerController = async (req, res) => {
  const { id_organizer } = req.params;


  if (!id_organizer) {
    return response.badRequest(res, "Organizer ID is required");
  }

  try {
    const concerts = await getConcertByOrganizerModel(id_organizer);
    if (!concerts.length) {
      return response.notFound(res, "No concerts found for this organizer");
    }
    return response.success(res, "Concerts fetched successfully", concerts);
  } catch (error) {
    return response.serverError(res, "Failed to get concerts", error.message);
  }
};

export const updateConcertStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (status === undefined) {
        return response.badRequest(res, "Status is required");
    }

    let statusValue;
    if (status.toLowerCase() === 'active') {
        statusValue = 1;
    } else if (status.toLowerCase() === 'inactive') {
        statusValue = 0;
    } else {
        return response.badRequest(res, "Invalid status value. Use 'active' or 'inactive'.");
    }

    try {
        const updatedConcert = await updateConcertStatusModel(id, statusValue);
        if (!updatedConcert) {
            return response.notFound(res, "Concert not found");
        }
        return response.success(res, "Concert status updated successfully", updatedConcert);
    } catch (error) {
        return response.serverError(res, "Failed to update concert status", error.message);
    }
};

export const deleteConcertController = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedConcert = await deleteConcertModel(id);
        if (!deletedConcert) {
            return response.notFound(res, "Concert not found");
        }
        return response.success(res, "Concert deleted successfully", deletedConcert);
    } catch (error) {
        return response.serverError(res, "Failed to delete concert", error.message);
    }
};
