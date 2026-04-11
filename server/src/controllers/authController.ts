import { Response } from 'express';
import { UserRole, AuthProvider } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateToken,
  generateRandomToken,
  getTokenExpiry,
} from '../auth/jwt.js';
import {
  RegisterInput,
  LoginInput,
  UpdateProfileInput,
} from '../auth/schemas.js';
import { AppError } from '../middleware/error.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(501).json({ message: 'Registration logic has been removed.' });
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(501).json({ message: 'Login logic has been removed.' });
};

export const logout = (req: AuthRequest, res: Response): void => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        provider: true,
        emailVerified: true,
        lastLogin: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to fetch user' });
    }
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { name, image } = req.body as UpdateProfileInput;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
      },
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
};

export const oauthLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  res.status(501).json({ message: 'OAuth login logic has been removed.' });
};
