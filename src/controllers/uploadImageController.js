import { put } from '@vercel/blob';
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
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
    });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: blob
    });

  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
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