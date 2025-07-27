import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from './controller';

import { protect, authorize } from '../../middleware/auth';

const router = Router();

// Public: anyone logged in can view
router.get('/', protect, getAllProducts);
router.get('/:id', protect, getProductById);

// Vendor or Admin: create/update products
router.post('/', protect, authorize('vendor', 'admin'), createProduct);
router.put('/:id', protect, authorize('vendor', 'admin'), updateProduct);

// Vendor orAdmin only: delete any product
router.delete('/:id', protect, authorize('vendor', 'admin'), deleteProduct);

export default router;

