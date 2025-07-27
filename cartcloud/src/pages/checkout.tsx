import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useToast } from '../components/ui/toast';
import { Minus, Plus, Trash2, Package } from 'lucide-react';



export default function Checkout() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, error: cartError, fetchCart, updateCartItem, removeFromCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  

  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    console.log('Checkout useEffect triggered:', { user: user?.id, cartLoading, cart: cart?.items?.length });
    
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Only fetch cart if we don't have cart data and we're not already loading
    if (!cart && !cartLoading) {
      console.log('Fetching cart for user:', user.id);
      fetchCart();
    }
  }, [user, navigate]);

  // Debug logs
  useEffect(() => {
    console.log('Cart state changed:', { 
      loading: cartLoading, 
      error: cartError, 
      itemCount: cart?.items?.length || 0,
      user: user?.id,
      cartData: cart
    });
  }, [cartLoading, cartError, cart, user]);

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.productId?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.15; // 15% tax
  const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
  const total = subtotal + tax + shipping;



  const handleQuantityUpdate = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      addToast({
        title: 'Invalid Quantity',
        description: 'Quantity must be at least 1.',
        variant: 'error',
        duration: 3000
      });
      return;
    }
    
    console.log('Checkout: Updating quantity:', { productId, newQuantity });
    const success = await updateCartItem(productId, newQuantity);
    if (!success) {
      addToast({
        title: 'Update Failed',
        description: 'Failed to update item quantity. Please try again.',
        variant: 'error',
        duration: 3000
      });
    } else {
      addToast({
        title: 'Quantity Updated',
        description: 'Item quantity has been updated.',
        variant: 'success',
        duration: 2000
      });
    }
  };

  const handleRemoveItem = async (productId: string, productName: string) => {
    console.log('Checkout: Removing item:', { productId, productName });
    const success = await removeFromCart(productId);
    if (success) {
      addToast({
        title: 'Item Removed',
        description: `${productName} has been removed from your cart.`,
        variant: 'success',
        duration: 3000
      });
    } else {
      addToast({
        title: 'Remove Failed',
        description: 'Failed to remove item from cart. Please try again.',
        variant: 'error',
        duration: 3000
      });
    }
  };



  if (cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="checkout" />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Loading your cart...</p>
            <p className="text-xs text-gray-400 mt-2">User: {user?.id || 'Not logged in'}</p>
            <p className="text-xs text-gray-400">API URL: {API_URL}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle empty cart or error state
  if (cartError || !cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="checkout" />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {cartError ? 'Error Loading Checkout' : 'Your Cart is Empty'}
              </h2>
              <p className="text-gray-600 mb-4">
                {cartError || 'Add some items to your cart before checking out.'}
              </p>
              {cartError && (
                <p className="text-xs text-red-500 mb-4">Error: {cartError}</p>
              )}
              <div className="space-y-2">
                <Button onClick={() => navigate('/products')} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header page="checkout" />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items and proceed to checkout</p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item, index) => {
                // Safely handle potentially undefined values
                const productName = item.productId?.name || 'Unknown Product';
                const productPrice = item.productId?.price || 0;
                const productImage = item.productId?.imageUrl;
                const fallbackImage = `https://placehold.co/200x200/cccccc/333333?text=${productName.replace(/\s/g, '+')}`;
                
                return (
                  <div key={item.productId._id || index} className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={productImage && productImage.trim() !== '' ? productImage : fallbackImage}
                        alt={productName}
                        className="w-16 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackImage;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{productName}</p>
                        <p className="text-sm text-gray-600">${productPrice.toFixed(2)} each</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">
                          ${(productPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  
                  {/* Quantity controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityUpdate(item.productId._id || '', item.quantity - 1)}
                        disabled={item.quantity <= 1 || cartLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityUpdate(item.productId._id || '', item.quantity + 1)}
                        disabled={cartLoading}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId._id || '', productName)}
                      disabled={cartLoading}
                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {index < cart.items.length - 1 && <hr className="my-3" />}
                  </div>
                );
              })}
              
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (15%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600">🎉 Free shipping on orders over $50!</p>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Ready to Checkout section */}
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <div className="text-center">
                  <h4 className="font-medium text-gray-900 mb-2 text-sm">Ready to Checkout?</h4>
                  <p className="text-gray-600 text-xs">
                    Review your items above and continue to payment for shipping address and payment details.
                  </p>
                </div>
              </div>

              <Button 
                className="w-full mt-6" 
                onClick={() => navigate('/payment')}
                disabled={cartLoading}
                size="lg"
              >
                Continue to Payment • ${total.toFixed(2)}
              </Button>
              
              <p className="text-xs text-gray-500 text-center mt-2">
                By placing this order, you agree to our terms and conditions.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 