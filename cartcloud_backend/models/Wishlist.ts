import mongoose, { Document, Schema } from 'mongoose';

interface WishlistItem {
  productId: mongoose.Schema.Types.ObjectId;
  addedAt: Date;
}

export interface Wishlist extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<WishlistItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const wishlistSchema = new Schema<Wishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [wishlistItemSchema],
}, { timestamps: true });

const WishlistModel = mongoose.model<Wishlist>('Wishlist', wishlistSchema);
export default WishlistModel; 