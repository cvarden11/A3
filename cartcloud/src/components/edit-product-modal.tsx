import React, { useState, useEffect } from 'react';
import axios from 'axios';
import type { Product } from '@/types/product';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null; // The product to be edited, or null if creating a new one
  onProductUpdated: (updatedProduct: Product) => void;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, product, onProductUpdated }) => {
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (product) {
      // Ensure all fields are present or defaulted for the form
      setFormData({
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        vendorId: product.vendorId,
      });
    } else {
      // This modal is intended for editing, so 'product' should ideally not be null.
      // However, providing a default for safety.
      setFormData({
        name: '',
        category: '',
        price: 0,
        stock: 0,
        imageUrl: '',
        vendorId: '', // Default vendorId if creating (though not the primary use case here)
      });
    }
    setError(null);
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!product || !product._id) {
        setError('No product selected for editing.');
        return;
      }

      // Ensure formData has all required Product properties for the PUT request
      const updatedProductData: Product = {
        _id: product._id,
        name: formData.name || product.name,
        category: formData.category || product.category,
        price: formData.price !== undefined ? formData.price : product.price,
        stock: formData.stock !== undefined ? formData.stock : product.stock,
        imageUrl: formData.imageUrl || product.imageUrl,
        vendorId: product.vendorId, // vendorId should not change during product edit
      };

      const { data } = await axios.put<Product>(
        `${API_URL}/products/${product._id}`,
        updatedProductData, // Send the full updated product data
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      onProductUpdated(data); // Notify parent component of the update
      onClose(); // Close the modal
    } catch (err) {
      console.error("Error updating product:", err);
      setError('Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
        <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-3xl font-light"
        >
          &times;
        </button>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price || 0}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              step="0.01"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">
              Image URL
            </label>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl || ''}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
