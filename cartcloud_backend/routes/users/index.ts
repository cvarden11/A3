// routes/users/index.ts
import { Router } from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getAccountBalance,
} from './controller';

import { protect, authorize } from '../../middleware/auth';

const router = Router();

router.post('/', createUser);

// Admin: view all users
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id/account-balance', protect, getAccountBalance);

// Logged-in users: change their own password
router.put('/:id/password', protect, changePassword);

// Logged-in users: view/update their own profile
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);


// Admin: delete any user
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

