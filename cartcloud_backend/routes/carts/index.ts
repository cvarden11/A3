import { Router } from 'express';
import {
  getCartByUser,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from './controller';

const router = Router();

router.get('/:userId', getCartByUser);
router.post('/:userId', addToCart);
router.put('/:userId', updateCartItem);
router.delete('/:userId/:productId', removeCartItem);
router.delete('/:userId', clearCart);

export default router; 