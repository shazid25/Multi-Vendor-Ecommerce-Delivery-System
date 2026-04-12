import { Router } from 'express';
import { 
  getAvailableDeliveryPartners,
  assignDeliveryPartner
} from '../controllers/orderController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.get('/partners', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), getAvailableDeliveryPartners);
router.post('/assign', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), assignDeliveryPartner);

export default router;
