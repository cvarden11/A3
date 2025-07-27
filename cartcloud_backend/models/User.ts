import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

interface Address {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface VendorProfile {
  storeName: string;
  storeSlug: string;
  isActive: boolean;
}

interface VendorBalance {
  vendorId: mongoose.Schema.Types.ObjectId;
  vendorName: string;
  amount: number;
  orders: mongoose.Schema.Types.ObjectId[];
}

export interface User extends Document {
  role: "customer" | "vendor" | "admin";
  name: string;
  email: string;
  password: string;
  address: Address;
  createdAt: Date;
  vendorProfile?: VendorProfile;
  accountBalance?: {
    totalOwed: number;
    vendorBalances: VendorBalance[];
  };
}


const addressSchema = new Schema({
  street: { type: String, required: false },
  city: { type: String, required: false },
  province: { type: String, required: false },
  postalCode: { type: String, required: false },
  country: { type: String, required: false, default: 'Canada' },
}, { _id: false });

const vendorProfileSchema = new Schema({
  storeName: { type: String, required: false },
  storeSlug: { type: String, required: false },
  isActive: { type: Boolean, required: false, default: true },
}, { _id: false });

const vendorBalanceSchema = new Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vendorName: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
}, { _id: false });

const accountBalanceSchema = new Schema({
  totalOwed: { type: Number, required: true, default: 0 },
  vendorBalances: [vendorBalanceSchema],
}, { _id: false });

const userSchema = new Schema<User>({
  role: { type: String, enum: ["customer", "vendor", "admin"], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: addressSchema },
  vendorProfile: { type: vendorProfileSchema, required: false },
  accountBalance: { type: accountBalanceSchema, required: false },
}, { timestamps: { createdAt: true, updatedAt: true } });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const UserModel = mongoose.model<User>('User', userSchema);
export default UserModel;
