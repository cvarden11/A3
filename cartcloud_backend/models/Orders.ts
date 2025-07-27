import mongoose, { Document, Schema } from 'mongoose';

interface OrderItem {
  productId: mongoose.Schema.Types.ObjectId,
  name: string,
  vendorId: mongoose.Schema.Types.ObjectId,
  quantity: number,
  priceAtPurchase: number,
  status: string, 
}

interface ShippingAddress {
  street: string,
  city: string,
  province: string,
  postalCode: string,
  country: string,
}

export interface Order extends Document {
  orderNumber: string,
  items: OrderItem[],
  userId: mongoose.Schema.Types.ObjectId,
  shippingAddress: ShippingAddress,
  paymentMethod: string,
  paymentTransactionId?: string,
  paymentStatus: string,
  subtotal: number,
  tax: number,
  shipping: number,
  total: number,
  status: string,
  trackingNumber?: string,
  vendors: mongoose.Schema.Types.ObjectId [],
  createdAt: Date,
  soldAt?: Date,
  updatedAt: Date, 
  isInCart: boolean,
}


const shippingAddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'Canada' },
}, { _id: false });

const orderItemSchema = new Schema<OrderItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
}, { _id: false });

const orderSchema = new Schema<Order>({
  orderNumber: { type: String, required: true, unique: true },
  items: [orderItemSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shippingAddress: { type: shippingAddressSchema, required: true },
  paymentMethod: { type: String, required: true },
  paymentTransactionId: { type: String },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"], default: "pending" },
  trackingNumber: { type: String },
  vendors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  soldAt: { type: Date },
  isInCart: { type: Boolean, default: false }
}, { timestamps: true });

const OrderModel = mongoose.model<Order>('Order', orderSchema);
export default OrderModel; 