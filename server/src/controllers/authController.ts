import { Response } from 'express';
import { AppError } from '../middleware/error.js';
import { AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

/**
 * Get current authenticated user details from database
 */
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
        emailVerified: true,
        lastLogin: true,
        isActive: true,
        totalSpent: true,
      },
    });

    if (!user) {
      throw new AppError('User not found in database', 404);
    }

    res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      console.error('getCurrentUser Error:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  }
};

/**
 * Update current user's profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }

    const { name, image, phone } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(image && { image }),
        ...(phone && { phone }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        phone: true,
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
      console.error('updateProfile Error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }
};

/**
 * Logout - handled by client, but we can clear server-side cookies if any
 */
export const logout = (req: AuthRequest, res: Response): void => {
  res.clearCookie('better-auth.session-token');
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        vendor: { select: { shopName: true, balance: true, totalSales: true } },
        deliveryPartner: { select: { totalEarnings: true, totalDeliveries: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('getAllUsers Error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as any },
    });

    if (role === 'VENDOR') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: id } });
      if (!vendor) {
        await prisma.vendor.create({
          data: {
            userId: id,
            shopName: user.name + "'s Shop",
            phoneNumber: user.phone || '0000000000',
            businessType: 'General',
          }
        });
      }
    } else if (role === 'DELIVERY_PARTNER') {
      const dp = await prisma.deliveryPartner.findUnique({ where: { userId: id } });
      if (!dp) {
        await prisma.deliveryPartner.create({
          data: {
            userId: id,
            phoneNumber: user.phone || '0000000000',
            vehicleType: 'Motorcycle',
            licenseNumber: 'TBD',
            licenseExpiry: new Date(),
            nidNumber: 'TBD',
          }
        });
      }
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('updateUserRole Error:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser Error:', error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('getNotifications Error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

// Placeholders for removed logic
export const register = (req: AuthRequest, res: Response) => res.status(501).json({ message: 'Registration handled by client' });
export const login = (req: AuthRequest, res: Response) => res.status(501).json({ message: 'Login handled by client' });
export const oauthLogin = (req: AuthRequest, res: Response) => res.status(501).json({ message: 'OAuth handled by client' });
