import mongoose, { Document, Schema } from 'mongoose';

interface CartItem {
  productId: mongoose.Schema.Types.ObjectId;
  quantity: number;
}

export interface Cart extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<CartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const cartSchema = new Schema<Cart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [cartItemSchema],
}, { timestamps: true });

const CartModel = mongoose.model<Cart>('Cart', cartSchema);
export default CartModel; 