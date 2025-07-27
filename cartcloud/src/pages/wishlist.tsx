import React, { useState, useEffect } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import axios from "axios";
import { HeartIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";

interface WishlistItem {
  _id: string;
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  vendorId: string;
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Wishlist: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get<{ items: any[] }>(`${API_URL}/wishlists/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const mapped = (data.items || []).map((entry) => {
          const product = entry.productId ?? {}; 
          const itemObj: WishlistItem = {
            _id: product._id || entry.productId,
            id: product._id || entry.productId,
            name: product.name ?? "Unknown",
            price: product.price ?? 0,
            imageUrl: product.imageUrl ?? "https://placehold.co/200x200?text=No+Image",
            category: product.category ?? "Unknown",
            stock: product.stock ?? 0,
            vendorId: product.vendorId ?? "",
          };
          return itemObj;
        });

        setItems(mapped);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemove = async (id: string) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/wishlists/${user.id}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item from wishlist.");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="wishlist" role="customer" />
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
          <div className="flex flex-col items-center justify-center w-full py-20">
            <HeartIcon size={60} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Please log in to view your wishlist</h2>
            <p className="text-gray-500 mb-6 text-center max-w-xs">You need to be logged in to access your wishlist.</p>
            <Link to="/">
              <Button>Log In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header page="wishlist" role="customer" />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full py-20">
            <HeartIcon size={60} className="text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6 text-center max-w-xs">Browse our catalog and tap the heart icon on products you love to save them here.</p>
            <Link to="/products">
              <Button>Shop Now</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                showCategory={false}
                showRemoveButton={true}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Wishlist; 