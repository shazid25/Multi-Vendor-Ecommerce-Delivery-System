import { Router } from 'express';
import { 
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner,
  getFAQs, getAllFAQs, createFAQ, updateFAQ, deleteFAQ 
} from '../controllers/cmsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

// Banners
router.get('/banners', getBanners);
router.get('/banners/all', authMiddleware, requireRole('SUPER_ADMIN'), getAllBanners);
router.post('/banners', authMiddleware, requireRole('SUPER_ADMIN'), createBanner);
router.put('/banners/:id', authMiddleware, requireRole('SUPER_ADMIN'), updateBanner);
router.delete('/banners/:id', authMiddleware, requireRole('SUPER_ADMIN'), deleteBanner);

// FAQs
router.get('/faqs', getFAQs);
router.get('/faqs/all', authMiddleware, requireRole('SUPER_ADMIN'), getAllFAQs);
router.post('/faqs', authMiddleware, requireRole('SUPER_ADMIN'), createFAQ);
router.put('/faqs/:id', authMiddleware, requireRole('SUPER_ADMIN'), updateFAQ);
router.delete('/faqs/:id', authMiddleware, requireRole('SUPER_ADMIN'), deleteFAQ);

export default router;
