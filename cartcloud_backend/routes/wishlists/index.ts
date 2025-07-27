import { Router } from 'express';
import {
  getWishlistByUser,
  addToWishlist,
  removeWishlistItem,
} from './controller';

const router = Router();

router.get('/:userId', getWishlistByUser);
router.post('/:userId', addToWishlist);
router.delete('/:userId/:productId', removeWishlistItem);

export default router; 