import { Router } from 'express';
import {
  getOrderById,
  getOrdersByUser,
  getAnalytics,
  createOrder,
  cancelOrder,
  markOrderAsDelivered,
  addToOrder,
  updateOrderItem,
  removeOrderItem,
} from './controller';

const router = Router();

// Individual order details
router.get('/:orderId', getOrderById);

// Cancel an order
router.patch('/:orderId/cancel', cancelOrder);

// Mark order as delivered
router.patch('/:orderId/deliver', markOrderAsDelivered);

// User order management (matches frontend expectations)
router.get('/user/:userId', getOrdersByUser);
router.post('/user/:userId', createOrder);

// Analytics for vendors
router.get('/analytics/:vendorId', getAnalytics);

// Legacy order management (can be deprecated later)
router.post('/:userId', addToOrder);
router.put('/:userId', updateOrderItem);
router.put('/:userId/:productId', removeOrderItem);

export default router; 