import { Request, Response } from 'express';
import ProductModel, { Product } from '../../models/Product';

export const createProduct = async (req: Request, res: Response) : Promise<any> => {
  try {
    const product = new ProductModel(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create product', details: err });
  }
};

export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const { q } = req.query as { q?: string };

    let filter = {};
    if (q && typeof q === 'string' && q.trim() !== '') {
      // Escape regex special chars to prevent ReDoS / injection
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter = {
        name: { $regex: escaped, $options: 'i' },
      };
    }

    const products = await ProductModel.find(filter);
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err });
  }
};

export const getProductById = async (req: Request, res: Response) : Promise<any>=> {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: 'Invalid product ID', details: err });
  }
};

export const updateProduct = async (req: Request, res: Response) : Promise<any> => {
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product', details: err });
  }
};

export const deleteProduct = async (req: Request, res: Response) : Promise<any>=> {
  try {
    const deletedProduct = await ProductModel.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete product', details: err });
  }
};
