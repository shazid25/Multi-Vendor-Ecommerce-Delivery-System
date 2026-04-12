import { Router, json } from 'express';
import {
  getCurrentUser,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getNotifications,
} from '../controllers/authController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

// 1. CUSTOM PROTECTED ROUTES
router.get('/me', authMiddleware, getCurrentUser);
router.put('/profile', json(), authMiddleware, updateProfile);
router.get('/notifications', authMiddleware, getNotifications);

// 2. ADMIN ROUTES
router.get('/users', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), getAllUsers);
router.patch('/users/:id/role', json(), authMiddleware, requireRole('SUPER_ADMIN'), updateUserRole);
router.delete('/users/:id', authMiddleware, requireRole('SUPER_ADMIN'), deleteUser);

export default router;
