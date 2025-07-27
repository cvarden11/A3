import { Request, Response } from 'express';
import OrderModel from '../../models/Orders';
import ProductModel from '../../models/Product';
import CartModel from '../../models/Cart';
import UserModel from '../../models/User';
import mongoose from 'mongoose';

const analyticsCache: {
  [vendorId: string]: { data: any; timestamp: number }
} = {};

const CACHE_TTL_MS = 10 * 60 * 1000;

// Get a specific order by ID
export const getOrderById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orderId } = req.params;
    
    console.log('Fetching order by ID:', orderId);
    
    // Find the order by ID and populate product details
    const order = await OrderModel.findById(orderId)
      .populate('items.productId')
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    console.log('Order found:', order);
    
    return res.status(200).json(order);
  } catch (err) {
    console.error('Error fetching order by ID:', err);
    return res.status(500).json({ error: 'Failed to fetch order details', details: err });
  }
};

// Get orders for a specific user (matches frontend: GET /orders/user/:userId)
export const getOrdersByUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    
    // Find all orders for this user that are not in cart (completed orders)
    const orders = await OrderModel.find({ 
      userId: userId, 
      isInCart: false 
    })
    .populate('items.productId')
    .sort({ createdAt: -1 }); // Most recent first

    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    return res.status(200).json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return res.status(500).json({ error: 'Failed to fetch orders', details: err });
  }
};

// Create a new order from checkout (matches frontend: POST /orders/user/:userId)
export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const {
      shippingAddress,
      paymentMethod,
      paymentTransactionId,
      paymentStatus,
      subtotal,
      tax,
      shipping,
      total
    } = req.body;

    console.log('Creating order for user:', userId);
    console.log('Order data:', req.body);

    // Get user's current cart
    const cart = await CartModel.findOne({ userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Convert cart items to order items
    const orderItems = [];
    const vendors = new Set();

    for (const cartItem of cart.items) {
      if (!cartItem.productId) {
        console.warn('Cart item missing product:', cartItem);
        continue;
      }

      const product = cartItem.productId as any;
      orderItems.push({
        productId: product._id,
        name: product.name,
        vendorId: product.vendorId,
        quantity: cartItem.quantity,
        priceAtPurchase: product.price,
        status: 'pending'
      });
      
      vendors.add(product.vendorId.toString());
    }

    if (orderItems.length === 0) {
      return res.status(400).json({ error: 'No valid items in cart' });
    }

    // Create the order
    const order = new OrderModel({
      orderNumber,
      items: orderItems,
      userId,
      shippingAddress,
      paymentMethod,
      paymentTransactionId,
      paymentStatus: paymentStatus || 'paid',
      subtotal,
      tax,
      shipping,
      total,
      status: 'confirmed',
      vendors: Array.from(vendors),
      isInCart: false // This is a completed order, not a cart
    });

    const savedOrder = await order.save();
    console.log('Order created successfully:', savedOrder.orderNumber);

    // Update account balance for all payment methods (customers owe money until orders are completed)
    try {
      console.log(`🏦 Processing account balance update for payment method: ${paymentMethod}`);
      await updateAccountBalance(userId, savedOrder);
      console.log('✅ Account balance updated successfully');
    } catch (balanceError) {
      console.error('❌ Failed to update account balance:', balanceError);
      // Don't fail the order creation if balance update fails
    }

    // Clear the user's cart after successful order
    try {
      await CartModel.findOneAndUpdate(
        { userId },
        { $set: { items: [] } }
      );
      console.log('Cart cleared after order creation');
    } catch (cartError) {
      console.warn('Failed to clear cart after order creation:', cartError);
      // Don't fail the order creation if cart clearing fails
    }

    return res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Error creating order:', err);
    return res.status(400).json({ error: 'Failed to create order', details: err });
  }
};

// Get analytics for vendors
export const getAnalytics = async (req: Request, res: Response): Promise<any> => {
  try {
    const { vendorId } = req.params;
    const cacheKey = vendorId;
    const now = Date.now();

    const cached = analyticsCache[cacheKey];
    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      console.log('Serving analytics from cache');
      return res.status(200).json(cached.data);
    }

    const vendorObjectId = new mongoose.Types.ObjectId(vendorId);

    const monthlyData = await OrderModel.aggregate([
      { $match: { isInCart: false, 'items.vendorId': vendorObjectId } },
      { $unwind: '$items' },
      { $match: { 'items.vendorId': vendorObjectId } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          count: 1
        }
      },
      { $sort: { month: 1 } }
    ]);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const monthlySales = Array.from({ length: 12 }, (_, i) => {
      const data = monthlyData.find(d => d.month === i + 1);
      return { 
        month: monthNames[i],
        sales: data ? data.count : 0
      };
    })||[];
    

    const [completedData] = await OrderModel.aggregate([
  { $match: { 'items.vendorId': vendorObjectId } },
  { $unwind: '$items' },
  { $match: { 'items.vendorId': vendorObjectId } },
  {
    $group: {
      _id: null,
      totalItemsSold: { $sum: '$items.quantity' },
      totalRevenue: {
        $sum: {
          $multiply: ['$items.quantity', '$items.priceAtPurchase']
        }
      }
    }
  }
]);

const result = await CartModel.aggregate([
  { $unwind: '$items' },
  {
    $lookup: {
      from: 'products',
      localField: 'items.productId',
      foreignField: '_id',
      as: 'productDetails',
    },
  },
  { $unwind: '$productDetails' },
  {
    $match: {
      'productDetails.vendorId': vendorObjectId,
    },
  },
  {
    $group: {
      _id: null,
      totalQuantity: { $sum: '$items.quantity' },
    },
  },
]);



    const analytics = {
      monthlySales,
      totalSales: completedData?.totalItemsSold|| 0,
      totalRevenue: completedData?.totalRevenue || 0,
      totalInCart: result[0]?.totalQuantity || 0,
    };
    
    analyticsCache[cacheKey] = {
      data: analytics,
      timestamp: Date.now()
    };

    return res.status(200).json(analytics);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to fetch analytics', details: err });
  }
};

// Cancel an order
export const cancelOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body; // Optional cancellation reason
    
    console.log('Cancelling order:', orderId);
    
    // Find the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        error: 'Order cannot be cancelled', 
        message: `Orders with status '${order.status}' cannot be cancelled. Only orders that are pending, confirmed, or processing can be cancelled.`
      });
    }

    // Update order status to cancelled
    order.status = 'cancelled';
    
    // Update all order items to cancelled status
    order.items.forEach(item => {
      if (cancellableStatuses.includes(item.status)) {
        item.status = 'cancelled';
      }
    });

    // If order was paid, mark payment status as refunded
    if (order.paymentStatus === 'paid') {
      order.paymentStatus = 'refunded';
    }

    // Add cancellation metadata
    (order as any).cancellationReason = reason || 'Customer requested cancellation';
    (order as any).cancelledAt = new Date();

    await order.save();

    // Remove from account balance since order is cancelled
    try {
      await removeFromAccountBalance(order.userId.toString(), orderId);
      console.log('✅ Order removed from account balance due to cancellation');
    } catch (balanceError) {
      console.error('❌ Failed to remove cancelled order from account balance:', balanceError);
    }
    
    console.log('Order cancelled successfully:', order.orderNumber);
    
    return res.status(200).json({
      message: 'Order cancelled successfully',
      order: order,
      refundInfo: order.paymentStatus === 'refunded' ? {
        amount: order.total,
        status: 'Refund will be processed within 3-5 business days'
      } : null
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    return res.status(500).json({ error: 'Failed to cancel order', details: err });
  }
};

// Helper function to update account balance when payment method is account_balance
const updateAccountBalance = async (userId: string, order: any): Promise<void> => {
  try {
    console.log('🔄 Updating account balance for user:', userId, 'order:', order.orderNumber);

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Initialize account balance if it doesn't exist
    if (!user.accountBalance) {
      console.log('🆕 Initializing new account balance for user');
      user.accountBalance = {
        totalOwed: 0,
        vendorBalances: []
      };
    } else {
      console.log('📊 Current account balance:', user.accountBalance.totalOwed);
    }

    // Group order items by vendor
    const vendorTotals: Map<string, { vendorId: string; vendorName: string; amount: number; }> = new Map();
    
    for (const item of order.items) {
      const vendorId = item.vendorId.toString();
      const itemTotal = item.priceAtPurchase * item.quantity;
      
      if (vendorTotals.has(vendorId)) {
        vendorTotals.get(vendorId)!.amount += itemTotal;
      } else {
        // Get vendor name
        const vendor = await UserModel.findById(vendorId).select('name vendorProfile');
        const vendorName = vendor?.vendorProfile?.storeName || vendor?.name || 'Unknown Vendor';
        
        vendorTotals.set(vendorId, {
          vendorId,
          vendorName,
          amount: itemTotal
        });
      }
    }

    // Update vendor balances
    for (const [vendorId, vendorData] of vendorTotals) {
      const existingVendorBalance = user.accountBalance.vendorBalances.find(
        vb => vb.vendorId.toString() === vendorId
      );

      if (existingVendorBalance) {
        // Update existing vendor balance
        existingVendorBalance.amount += vendorData.amount;
        existingVendorBalance.orders.push(order._id);
      } else {
        // Add new vendor balance
        user.accountBalance.vendorBalances.push({
          vendorId: vendorId as unknown as mongoose.Schema.Types.ObjectId,
          vendorName: vendorData.vendorName,
          amount: vendorData.amount,
          orders: [order._id]
        });
      }
    }

    // Update total owed
    const previousTotal = user.accountBalance.totalOwed;
    user.accountBalance.totalOwed += order.total;

    // Save user with updated account balance
    await user.save();
    
    console.log(`💰 Account balance updated successfully!`);
    console.log(`   Previous total: $${previousTotal.toFixed(2)}`);
    console.log(`   Order amount: $${order.total.toFixed(2)}`);
    console.log(`   New total owed: $${user.accountBalance.totalOwed.toFixed(2)}`);
    console.log(`   Vendors affected: ${vendorTotals.size}`);
  } catch (error) {
    console.error('Error updating account balance:', error);
    throw error;
  }
};

// Helper function to remove order from account balance when completed/cancelled
const removeFromAccountBalance = async (userId: string, orderId: string): Promise<void> => {
  try {
    console.log('🗑️ Removing order from account balance:', orderId);

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user || !user.accountBalance) {
      console.log('No user or account balance found');
      return;
    }

    // Find and remove the order from vendor balances
    let totalReduction = 0;
    const order = await OrderModel.findById(orderId);
    if (!order) return;

    user.accountBalance.vendorBalances.forEach(vendorBalance => {
      const orderIndex = vendorBalance.orders.findIndex(id => id.toString() === orderId);
      if (orderIndex > -1) {
        // Remove order from vendor's order list
        vendorBalance.orders.splice(orderIndex, 1);
        
        // Recalculate vendor balance based on remaining orders
        const remainingOrderIds = vendorBalance.orders;
        // We'll recalculate the amount when the balance is retrieved
        console.log(`📦 Removed order ${orderId} from vendor ${vendorBalance.vendorName}`);
      }
    });

    // Remove vendors with no remaining orders
    user.accountBalance.vendorBalances = user.accountBalance.vendorBalances.filter(
      vendorBalance => vendorBalance.orders.length > 0
    );

    // Reduce total owed by order amount
    user.accountBalance.totalOwed = Math.max(0, user.accountBalance.totalOwed - order.total);

    await user.save();
    console.log(`✅ Order removed from account balance. New total: $${user.accountBalance.totalOwed.toFixed(2)}`);
  } catch (error) {
    console.error('Error removing order from account balance:', error);
    throw error;
  }
};

// Legacy functions (for backwards compatibility - can be deprecated)
export const addToOrder = async (req: Request, res: Response): Promise<any> => {
  return res.status(410).json({ error: 'This endpoint is deprecated. Use cart endpoints instead.' });
};

export const updateOrderItem = async (req: Request, res: Response): Promise<any> => {
  return res.status(410).json({ error: 'This endpoint is deprecated. Use cart endpoints instead.' });
};

export const removeOrderItem = async (req: Request, res: Response): Promise<any> => {
  return res.status(410).json({ error: 'This endpoint is deprecated. Use cart endpoints instead.' });
};

// Mark order as delivered (removes from account balance)
export const markOrderAsDelivered = async (req: Request, res: Response): Promise<any> => {
  try {
    const { orderId } = req.params;
    
    console.log('📦 Marking order as delivered:', orderId);
    
    // Find the order
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be marked as delivered
    const deliverableStatuses = ['confirmed', 'processing', 'shipped'];
    if (!deliverableStatuses.includes(order.status)) {
      return res.status(400).json({ 
        error: 'Order cannot be marked as delivered', 
        message: `Orders with status '${order.status}' cannot be marked as delivered.`
      });
    }

    // Update order status to delivered
    order.status = 'delivered';
    await order.save();

    // Remove from account balance since order is completed
    try {
      await removeFromAccountBalance(order.userId.toString(), orderId);
      console.log('✅ Order removed from account balance due to delivery');
    } catch (balanceError) {
      console.error('❌ Failed to remove delivered order from account balance:', balanceError);
    }
    
    console.log('Order marked as delivered successfully:', order.orderNumber);
    
    return res.status(200).json({
      message: 'Order marked as delivered successfully',
      order: order
    });
  } catch (err) {
    console.error('Error marking order as delivered:', err);
    return res.status(500).json({ error: 'Failed to mark order as delivered', details: err });
  }
}; 