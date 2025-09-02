import { getFileUrl } from '../models/uploadImageModel.js';

export const uploadImage = async (req, res) => {
    console.log('cek this file', req.body);
  try {
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get host and port from environment or request
    const host = process.env.LOCAL_HOST || req.get('host').split(':')[0] || '192.168.50.22';
    const port = process.env.PORT || 3000;

    // Return success response with file information
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = getFileUrl(relativePath, host, port);

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: relativePath,
        url: fileUrl
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during upload'
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