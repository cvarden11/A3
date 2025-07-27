import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './authContext';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    category?: string;
  };
  quantity: number;
}

interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  updateCartItem: (productId: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<boolean>;
  fetchCart: () => Promise<void>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const clearError = () => setError(null);

  const fetchCart = useCallback(async () => {
    if (!user || !user.id) {
      console.log('CartContext: No user or user ID, setting cart to null');
      setCart(null);
      setLoading(false);
      return;
    }

    console.log('CartContext: Fetching cart for user:', user.id);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      console.log('CartContext: Making API call to:', `${API_URL}/carts/${user.id}`);
      
      const response = await axios.get(`${API_URL}/carts/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('CartContext: Cart response:', response.data);
      setCart(response.data);
    } catch (err: any) {
      console.error('CartContext: Error fetching cart:', err);
      // Initialize empty cart if none exists
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        console.log('CartContext: Cart not found (404), creating empty cart');
        const emptyCart = { userId: user.id, items: [] };
        setCart(emptyCart);
        setError(null);
      } else {
        console.error('CartContext: Setting error:', err.message);
        setError('Failed to load cart');
      }
    } finally {
      console.log('CartContext: Setting loading to false');
      setLoading(false);
    }
  }, [user, API_URL]);

  const updateCartItem = async (productId: string, quantity: number): Promise<boolean> => {
    if (!user || !user.id) {
      setError('Please log in to update cart');
      return false;
    }

    console.log('CartContext: Updating cart item:', { productId, quantity, userId: user.id });
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/carts/${user.id}`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('CartContext: Update response:', response.data);
      
      // Update local state directly instead of refetching
      setCart(response.data);
      return true;
    } catch (err: any) {
      console.error('CartContext: Error updating cart item:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || 'Failed to update cart item');
        console.error('CartContext: Backend error:', err.response.data);
      } else {
        setError('Failed to update cart item');
      }
      return false;
    }
  };

  const removeFromCart = async (productId: string): Promise<boolean> => {
    if (!user || !user.id) {
      setError('Please log in to remove items from cart');
      return false;
    }

    console.log('CartContext: Removing from cart:', { productId, userId: user.id });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/carts/${user.id}/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('CartContext: Remove response:', response.data);
      
      // Update local state directly instead of refetching
      setCart(response.data);
      return true;
    } catch (err: any) {
      console.error('CartContext: Error removing from cart:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || 'Failed to remove item from cart');
        console.error('CartContext: Backend error:', err.response.data);
      } else {
        setError('Failed to remove item from cart');
      }
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!user || !user.id) {
      setError('Please log in to clear cart');
      return false;
    }

    console.log('CartContext: Clearing cart for user:', user.id);

    // Immediately clear local state first
    const emptyCart = { userId: user.id, items: [] };
    setCart(emptyCart);
    console.log('CartContext: Local cart state cleared immediately');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/carts/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('CartContext: Clear cart API response:', response.data);
      
      // Ensure state is still empty after API call
      setCart(emptyCart);
      
      console.log('CartContext: Cart cleared successfully');
      return true;
    } catch (err: any) {
      console.error('CartContext: Error clearing cart:', err);
      
      // Keep local cart empty even if API call fails
      setCart(emptyCart);
      console.log('CartContext: Cart kept empty locally despite API error');
      
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          // Cart not found - that's fine, it's already empty
          console.log('CartContext: Cart was already empty (404)');
          return true;
        }
        setError(err.response.data?.error || 'Failed to clear cart');
        console.error('CartContext: Backend error:', err.response.data);
      } else {
        setError('Failed to clear cart');
      }
      return true; // Return true since local state is cleared
    }
  };

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
    if (!user || !user.id) {
      setError('Please log in to add items to cart');
      return false;
    }

    console.log('CartContext: Adding to cart:', { productId, quantity, userId: user.id });
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/carts/${user.id}`,
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('CartContext: Add response:', response.data);
      
      // Update local state directly instead of refetching to prevent page refresh
      setCart(response.data);
      return true;
    } catch (err: any) {
      console.error('CartContext: Error adding to cart:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.error || 'Failed to add item to cart');
        console.error('CartContext: Backend error:', err.response.data);
      } else {
        setError('Failed to add item to cart');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getCartItemCount = (): number => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Fetch cart when user changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    fetchCart,
    clearCart,
    clearError,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 