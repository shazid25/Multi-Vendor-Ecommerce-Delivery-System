import { Router } from 'express';
import { 
  placeOrder, 
  getOrders, 
  getVendorOrders, 
  acceptOrder, 
  getDeliveryJobs, 
  markAsDelivered, 
  startTransit,
  getAvailableDeliveryPartners,
  assignDeliveryPartner
} from '../controllers/orderController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.post('/', authMiddleware, placeOrder);
router.get('/', authMiddleware, getOrders);
router.get('/vendor', authMiddleware, requireRole('VENDOR'), getVendorOrders);
router.patch('/:id/accept', authMiddleware, requireRole('VENDOR'), acceptOrder);
router.get('/delivery', authMiddleware, requireRole('DELIVERY_PARTNER'), getDeliveryJobs);
router.patch('/:id/deliver', authMiddleware, requireRole('DELIVERY_PARTNER'), markAsDelivered);
router.patch('/:id/transit', authMiddleware, requireRole('DELIVERY_PARTNER'), startTransit);

export default router;
