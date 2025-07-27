import mongoose, { Document, Schema } from 'mongoose';

export interface Product extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
  vendorId: mongoose.Schema.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<Product>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    // to-do: consider an enum here if categories are predefined
  },
  vendorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const ProductModel = mongoose.model<Product>('Product', productSchema);
export default ProductModel;