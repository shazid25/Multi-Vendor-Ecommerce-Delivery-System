import { Router } from 'express';
import { 
  getGlobalAnalytics, 
  getDeliveryPartnerStats, 
  getVendorStats, 
  getCustomerStats 
} from '../controllers/analyticsController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.get('/global', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), getGlobalAnalytics);
router.get('/delivery', authMiddleware, requireRole('DELIVERY_PARTNER'), getDeliveryPartnerStats);
router.get('/vendor', authMiddleware, requireRole('VENDOR'), getVendorStats);
router.get('/customer', authMiddleware, getCustomerStats);

export default router;
