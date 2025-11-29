import { supabase } from '../utils/supabase.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890abcdef', 10);

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const filename = `${nanoid()}-${req.file.originalname}`;
    
    // Upload file to Supabase
    const { data, error } = await supabase.storage
      .from('images') 
      .upload(filename, req.file.buffer, { // req.file.buffer is already in the correct format
        contentType: req.file.mimetype,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('images') // IMPORTANT: Replace with your bucket name
      .getPublicUrl(data.path);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully to Supabase',
      data: {
        url: publicUrlData.publicUrl,
        path: data.path,
      }
    });

  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during upload',
      error: error.message
    });
  }
};

export const handleUploadError = (error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB'
    });
  }

  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  res.status(500).json({
    success: false,
    message: error.message || 'Something went wrong'
  });
};

export const getImage = async (req, res) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const { data, error } = await supabase.storage
      .from('images') // IMPORTANT: Replace with your bucket name
      .download(filename);

    if (error) {
      throw error;
    }

    const file = new Blob([data], { type: data.type });
    const stream = file.stream();

    res.setHeader('Content-Type', file.type);
    res.setHeader('Content-Length', file.size);

    const reader = stream.getReader();
    reader.read().then(function processText({ done, value }) {
      if (done) {
        res.end();
        return;
      }
      res.write(value);
      return reader.read().then(processText);
    });

  } catch (error) {
    console.error('Error downloading from Supabase:', error);
    if (error.message.includes('The resource was not found')) {
      return res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during download',
      error: error.message
    });
  }
};