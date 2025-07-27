import { Request, Response } from 'express';
import CartModel from '../../models/Cart';
import ProductModel from '../../models/Product';
import mongoose from 'mongoose';

export const getCartByUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    console.log('Fetching cart for user:', userId);
    
    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log('Invalid userId provided:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const cart = await CartModel.findOne({ userId }).populate({
      path: 'items.productId',
      options: { strictPopulate: false }
    });
    
    if (!cart) {
      console.log('No cart found, returning empty cart');
      return res.status(200).json({ userId, items: [] });
    }
    
    // Filter out items where the product no longer exists
    const validItems = cart.items.filter(item => item.productId !== null);
    
    // If we filtered out some items, update the cart
    if (validItems.length !== cart.items.length) {
      console.log(`Removed ${cart.items.length - validItems.length} items with missing products`);
      cart.items = validItems;
      await cart.save();
    }
    
    console.log('Cart found with valid items:', cart);
    return res.status(200).json(cart);
  } catch (err) {
    console.error('Error fetching cart:', err);
    return res.status(500).json({ error: 'Failed to fetch cart', details: err });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { productId, quantity = 1 } = req.body as { productId: string; quantity: number };

    console.log('Adding to cart:', { userId, productId, quantity });

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log('Invalid userId provided:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Validate input
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    // Validate product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }

    console.log('Product found:', product.name);

    // Find or create cart
    let cart = await CartModel.findOne({ userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new CartModel({ userId, items: [] });
    }

    // Check if product already exists in cart
    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    
    if (itemIndex > -1) {
      // Update quantity if product already exists in cart
      console.log('Product already in cart, updating quantity');
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Add new product to cart
      console.log('Adding new product to cart');
      cart.items.push({ 
        productId: productId as unknown as mongoose.Schema.Types.ObjectId, 
        quantity 
      });
    }

    // Save cart
    const savedCart = await cart.save();
    console.log('Cart saved successfully');

    // Populate the cart with product details before returning
    const populatedCart = await CartModel.findById(savedCart._id).populate({
      path: 'items.productId',
      options: { strictPopulate: false }
    });
    
    // Filter out any items with missing products
    if (populatedCart) {
      const validItems = populatedCart.items.filter(item => item.productId !== null);
      if (validItems.length !== populatedCart.items.length) {
        console.log(`Removed ${populatedCart.items.length - validItems.length} items with missing products`);
        populatedCart.items = validItems;
        await populatedCart.save();
      }
    }
    
    return res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(400).json({ error: 'Failed to add to cart', details: err });
  }
};

export const updateCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { productId, quantity } = req.body as { productId: string; quantity: number };

    console.log('Updating cart item:', { userId, productId, quantity });

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log('Invalid userId provided:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex((item) => item.productId.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Product not in cart' });
    }

    cart.items[itemIndex].quantity = quantity;
    const savedCart = await cart.save();
    
    // Populate the cart with product details before returning
    const populatedCart = await CartModel.findById(savedCart._id).populate({
      path: 'items.productId',
      options: { strictPopulate: false }
    });
    
    // Filter out any items with missing products
    if (populatedCart) {
      const validItems = populatedCart.items.filter(item => item.productId !== null);
      if (validItems.length !== populatedCart.items.length) {
        console.log(`Removed ${populatedCart.items.length - validItems.length} items with missing products`);
        populatedCart.items = validItems;
        await populatedCart.save();
      }
    }
    
    return res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Error updating cart item:', err);
    return res.status(400).json({ error: 'Failed to update cart item', details: err });
  }
};

export const removeCartItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, productId } = req.params;

    console.log('Removing cart item:', { userId, productId });

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log('Invalid userId provided:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    const savedCart = await cart.save();
    
    // Populate the cart with product details before returning
    const populatedCart = await CartModel.findById(savedCart._id).populate({
      path: 'items.productId',
      options: { strictPopulate: false }
    });
    
    // Filter out any items with missing products
    if (populatedCart) {
      const validItems = populatedCart.items.filter(item => item.productId !== null);
      if (validItems.length !== populatedCart.items.length) {
        console.log(`Removed ${populatedCart.items.length - validItems.length} items with missing products`);
        populatedCart.items = validItems;
        await populatedCart.save();
      }
    }
    
    return res.status(200).json(populatedCart);
  } catch (err) {
    console.error('Error removing cart item:', err);
    return res.status(400).json({ error: 'Failed to remove cart item', details: err });
  }
};

export const clearCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;

    console.log('Clearing cart for user:', userId);

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.log('Invalid userId provided:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    cart.items = [];
    const savedCart = await cart.save();
    
    return res.status(200).json(savedCart);
  } catch (err) {
    console.error('Error clearing cart:', err);
    return res.status(400).json({ error: 'Failed to clear cart', details: err });
  }
}; 