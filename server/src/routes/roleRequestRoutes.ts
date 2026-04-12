import { Router } from 'express';
import { 
  submitVendorRequest, 
  submitDeliveryRequest, 
  getRoleRequests, 
  approveRoleRequest, 
  rejectRoleRequest 
} from '../controllers/roleRequestController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.post('/vendor', authMiddleware, submitVendorRequest);
router.post('/delivery', authMiddleware, submitDeliveryRequest);
router.get('/', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), getRoleRequests);
router.patch('/:id/approve', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), approveRoleRequest);
router.patch('/:id/reject', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), rejectRoleRequest);

export default router;
