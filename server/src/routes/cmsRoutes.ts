import { Router } from 'express';
import { 
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner,
  getFAQs, getAllFAQs, createFAQ, updateFAQ, deleteFAQ,
  getBlogs, getAllBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog,
  getHelpEntries, getAllHelpEntries, createHelpEntry, updateHelpEntry, deleteHelpEntry
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

// Blogs
router.get('/blogs', getBlogs);
router.get('/blogs/all', authMiddleware, requireRole('SUPER_ADMIN'), getAllBlogs);
router.get('/blogs/:slug', getBlogBySlug);
router.post('/blogs', authMiddleware, requireRole('SUPER_ADMIN'), createBlog);
router.put('/blogs/:id', authMiddleware, requireRole('SUPER_ADMIN'), updateBlog);
router.delete('/blogs/:id', authMiddleware, requireRole('SUPER_ADMIN'), deleteBlog);

// Help
router.get('/help', getHelpEntries);
router.get('/help/all', authMiddleware, requireRole('SUPER_ADMIN'), getAllHelpEntries);
router.post('/help', authMiddleware, requireRole('SUPER_ADMIN'), createHelpEntry);
router.put('/help/:id', authMiddleware, requireRole('SUPER_ADMIN'), updateHelpEntry);
router.delete('/help/:id', authMiddleware, requireRole('SUPER_ADMIN'), deleteHelpEntry);

export default router;
