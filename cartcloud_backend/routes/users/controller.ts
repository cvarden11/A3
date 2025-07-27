// routes/users/controller.ts
import { Request, Response } from 'express';
import UserModel from '../../models/User';
import OrderModel from '../../models/Orders';
import jwt from 'jsonwebtoken';

// GET all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// GET user by ID
export const getUserById = async (req: Request, res: Response) : Promise<any> => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};


// CREATE user
export const createUser = async (req: Request, res: Response) => {
  console.log('Request body:', req.body);
  try {
    const { name, email, password, role } = req.body;

    let assignedRole;
    // Only allow 'admin' role if the requester is already an admin
    if (role === 'admin' && (!req.user || req.user.role !== 'admin')) {
      assignedRole = 'customer'; 
    }
    else {
      assignedRole = role;
    }

    const newUser = new UserModel({
      name,
      email,
      password,
      role: assignedRole,
    });

    await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
};

// UPDATE user
export const updateUser = async (req: Request, res: Response) : Promise<any> => {
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    console.log('User updated successfully:', updatedUser);
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: string[] = [];
      for (const field in error.errors) {
        validationErrors.push(error.errors[field].message);
      }
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: { message: validationErrors.join(', '), details: error.errors }
      });
    }
    
    // Handle duplicate key errors (email already exists)
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Email already exists', 
        error: { message: 'This email is already registered' }
      });
    }
    
    res.status(400).json({ 
      message: 'Error updating user', 
      error: { message: error.message || 'Unknown error occurred' }
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user and update password 
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating password', error });
  }
};

// DELETE user
export const deleteUser = async (req: Request, res: Response) : Promise<any> => {
  try {
    const deletedUser = await UserModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

// GET account balance for a user
export const getAccountBalance = async (req: Request, res: Response): Promise<any> => {
  console.log('Getting account balance for user:', req.params);
  try {
    const { id: userId } = req.params;

    
    console.log('Getting account balance for user:', userId);
    
    // Find user with account balance
    const user = await UserModel.findById(userId).select('accountBalance name');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If no account balance exists, return zero balance
    if (!user.accountBalance) {
      return res.status(200).json({
        totalOwed: 0,
        vendorBalances: [],
        message: 'No outstanding balance'
      });
    }

    // Populate vendor details and recalculate totals based on outstanding orders only
    const vendorBalances = await Promise.all(
        user.accountBalance.vendorBalances.map(async (vendorBalance) => {
          // Get vendor details
          const vendor = await UserModel.findById(vendorBalance.vendorId).select('name vendorProfile');
          
          // Get order details for this vendor - only outstanding orders (not cancelled or delivered)
          const orders = await OrderModel.find({
            _id: { $in: vendorBalance.orders },
            status: { $in: ['pending', 'confirmed', 'processing', 'shipped'] }
          }).select('orderNumber total createdAt status items paymentMethod');

          // Calculate current outstanding amount (only from non-completed orders)
          const outstandingAmount = orders.reduce((sum, order) => sum + order.total, 0);

          return {
            vendorId: vendorBalance.vendorId,
            vendorName: vendor?.vendorProfile?.storeName || vendor?.name || 'Unknown Vendor',
            amount: outstandingAmount, // Use calculated amount from outstanding orders only
            orderCount: orders.length, // Count of outstanding orders only
            orders: orders.map(order => ({
              orderId: order._id,
              orderNumber: order.orderNumber,
              amount: order.total,
              date: order.createdAt,
              status: order.status,
              itemCount: order.items.length,
              paymentMethod: order.paymentMethod
            }))
          };
        })
      );

    // Calculate total owed from outstanding orders only
    const totalOwed = vendorBalances.reduce((sum, vendor) => sum + vendor.amount, 0);

    const accountBalanceWithVendors = {
      totalOwed,
      vendorBalances: vendorBalances.filter(vendor => vendor.amount > 0) // Only show vendors with outstanding balances
    };

    console.log('Account balance retrieved:', accountBalanceWithVendors);
    
    return res.status(200).json(accountBalanceWithVendors);
  } catch (err) {
    console.error('Error fetching account balance:', err);
    return res.status(500).json({ error: 'Failed to fetch account balance', details: err });
  }
};
