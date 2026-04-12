import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

// Support both NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and CLOUDINARY_CLOUD_NAME
const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const api_key = process.env.CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export const uploadImage = async (
  req: AuthRequestWithFile,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    if (!req.user) {
      throw new AppError('Unauthorized: Please log in to upload images', 401);
    }

    // Role-based folder organization
    const roleFolder = req.user.role ? req.user.role.toLowerCase() : 'general';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `green-mart/${roleFolder}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          res.status(500).json({ message: 'Cloudinary upload failed' });
          return;
        }

        res.status(200).json({
          message: 'Image uploaded successfully',
          url: result?.secure_url,
          publicId: result?.public_id,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error('Upload handler error:', error);
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Image upload failed' });
    }
  }
};

export const deleteImage = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { publicId } = req.body;

    if (!publicId) {
      throw new AppError('Public ID is required', 400);
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== 'ok') {
      throw new AppError('Failed to delete image from Cloudinary', 500);
    }

    res.status(200).json({
      message: 'Image deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Image deletion failed' });
    }
  }
};
