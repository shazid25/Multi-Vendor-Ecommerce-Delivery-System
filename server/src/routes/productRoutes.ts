import { Router } from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router: any = Router();

router.get('/', getProducts);
router.post('/', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), createProduct);
router.put('/:id', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), updateProduct);
router.delete('/:id', authMiddleware, requireRole('VENDOR', 'ADMIN', 'SUPER_ADMIN'), deleteProduct);

export default router;
