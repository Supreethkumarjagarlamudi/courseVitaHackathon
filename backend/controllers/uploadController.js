import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';


export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'event-images',
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'auto'
    });

    try {
      fs.unlinkSync(req.file.path);
      console.log('Temporary file cleaned up:', req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to clean up temporary file:', cleanupError.message);
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Upload error:', error);

    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
        console.log('Temporary file cleaned up on error:', req.file.path);
      } catch (cleanupError) {
        console.warn('Failed to clean up temporary file on error:', cleanupError.message);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};


export const deleteImage = async (req, res) => {
  try {
    const { public_id } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await cloudinary.uploader.destroy(public_id);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
