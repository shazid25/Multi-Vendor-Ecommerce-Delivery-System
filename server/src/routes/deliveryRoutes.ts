import { Router } from 'express';
import { 
  getAvailableDeliveryPartners,
  assignDeliveryPartner,
  getDeliveryEarnings
} from '../controllers/orderController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.get('/partners', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), getAvailableDeliveryPartners);
router.post('/assign', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), assignDeliveryPartner);
router.get('/earnings', authMiddleware, requireRole('DELIVERY_PARTNER'), getDeliveryEarnings);

export default router;
