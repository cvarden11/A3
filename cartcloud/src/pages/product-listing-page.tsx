import React, { useEffect, useState } from 'react';
import Header from '../components/header'
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import axios from 'axios';
import { useAuth } from '@/context/authContext';
import type { Product } from '@/types/product';


const ProductListingPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data } = await axios.get<Product[]>(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header page="shop" />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Products</h1>
        {loading ? (
          <p className="text-gray-600">Loading products...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductListingPage;
