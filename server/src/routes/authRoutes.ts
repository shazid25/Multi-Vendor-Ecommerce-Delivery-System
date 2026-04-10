import { Router, type Express } from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  oauthLogin,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router: any = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/oauth-login', oauthLogin);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);
router.put('/profile', authMiddleware, updateProfile);

export default router;
