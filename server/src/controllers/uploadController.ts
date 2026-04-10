import { Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { AuthRequest } from '../middleware/auth.js';
import { AppError } from '../middleware/error.js';

interface AuthRequestWithFile extends AuthRequest {
  file?: any;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
      throw new AppError('Unauthorized', 401);
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      throw new AppError('Only JPEG, PNG, GIF, and WebP images are allowed', 400);
    }

    const fileSize = req.file.size;
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) {
      throw new AppError('File size must be less than 5MB', 400);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecommerce/${req.user.role}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          res.status(500).json({ message: 'Upload failed' });
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
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Image upload failed' });
    }
  }
};

export const deleteImage = async (
  req: AuthRequestWithFile,
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

    await cloudinary.uploader.destroy(publicId);

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
