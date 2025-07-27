import { Request, Response } from 'express';
import WishlistModel from '../../models/Wishlist';
import ProductModel from '../../models/Product';
import mongoose from 'mongoose';

export const getWishlistByUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const wishlist = await WishlistModel.findOne({ userId }).populate('items.productId');
    if (!wishlist) {
      return res.status(200).json({ userId, items: [] });
    }
    return res.status(200).json(wishlist);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch wishlist', details: err });
  }
};

export const addToWishlist = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.params;
    const { productId } = req.body as { productId: string };
    console.log(userId, productId);
    // Validate the product exists
    const product = await ProductModel.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      wishlist = new WishlistModel({ userId, items: [] });
    }

    const alreadyExists = wishlist.items.some((item) => item.productId.toString() === productId);
    if (alreadyExists) {
      return res.status(200).json(wishlist); // No change needed
    }

    wishlist.items.push({ productId: productId as unknown as mongoose.Schema.Types.ObjectId, addedAt: new Date() });
    const savedWishlist = await wishlist.save();
    return res.status(200).json(savedWishlist);
  } catch (err) {
    return res.status(400).json({ error: 'Failed to add to wishlist', details: err });
  }
};

export const removeWishlistItem = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, productId } = req.params;

    const wishlist = await WishlistModel.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter((item) => item.productId.toString() !== productId);
    const savedWishlist = await wishlist.save();
    return res.status(200).json(savedWishlist);
  } catch (err) {
    return res.status(400).json({ error: 'Failed to remove wishlist item', details: err });
  }
}; 