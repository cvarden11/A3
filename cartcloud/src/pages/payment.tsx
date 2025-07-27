import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useToast } from '../components/ui/toast';
import { Minus, Plus, Trash2, CreditCard, Package, ArrowLeft, Truck } from 'lucide-react';
import axios from 'axios';

interface ShippingAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface ValidationErrors {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export default function Payment() {
  const { user } = useAuth();
  const { cart, loading: cartLoading, updateCartItem, removeFromCart, clearCart, fetchCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [orderLoading, setOrderLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('registered_card');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    street: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Canada'
  });
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const calculateSubtotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.productId?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  // 15% tax
  const tax = subtotal * 0.15;

  // Free shipping over $50
  const shipping = subtotal > 50 ? 0 : 9.99; 
  const total = subtotal + tax + shipping;

  const handleAddressChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validatePostalCode = (postalCode: string): boolean => {
    // Canadian postal code format: A1A 1A1
    const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    return canadianPostalCodeRegex.test(postalCode);
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!shippingAddress.street.trim()) {
      errors.street = 'Street address is required';
    }

    if (!shippingAddress.city.trim()) {
      errors.city = 'City is required';
    }

    if (!shippingAddress.province) {
      errors.province = 'Province is required';
    }

    if (!shippingAddress.postalCode.trim()) {
      errors.postalCode = 'Postal code is required';
    } else if (!validatePostalCode(shippingAddress.postalCode)) {
      errors.postalCode = 'Please enter a valid Canadian postal code (A1A 1A1)';
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      addToast({
        title: 'Form Validation Error',
        description: 'Please fix the highlighted fields.',
        variant: 'error',
        duration: 3000
      });
      return false;
    }

    if (!cart?.items || cart.items.length === 0) {
      addToast({
        title: 'Empty Cart',
        description: 'Your cart is empty. Add items before checkout.',
        variant: 'error',
        duration: 3000
      });
      return false;
    }

    return true;
  };

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

  // Mock payment processing
  const processPayment = async (orderData: any) => {
    console.log('Processing mock payment:', { paymentMethod, total: orderData.total });
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock payment result
    const paymentResult = {
      success: true,
      transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentMethod: paymentMethod,
      amount: orderData.total,
      status: paymentMethod === 'account_balance' ? 'credited_to_balance' : 'processed'
    };
    
    console.log('Mock payment result:', paymentResult);
    return paymentResult;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !user) return;

    setOrderLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        shippingAddress,
        paymentMethod,
        tax,
        shipping,
        subtotal,
        total
      };

      console.log('Placing order:', orderData);

      // Process mock payment first
      const paymentResult = await processPayment(orderData);
      
      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Create order in backend
      const response = await axios.post(
        `${API_URL}/orders/user/${user.id}`,
        {
          ...orderData,
          paymentTransactionId: paymentResult.transactionId,
          paymentStatus: 'paid'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order created:', response.data);

      // Set redirecting state BEFORE clearing cart to prevent empty cart modal
      setRedirecting(true);

      // Clear the cart after successful order
      console.log('Clearing cart after successful order...');
      const cartCleared = await clearCart();
      if (!cartCleared) {
        console.warn('Failed to clear cart after order placement');
        await fetchCart();
      } else {
        console.log('Cart cleared successfully');
      }

      // Show appropriate success message based on payment method
      const paymentMessage = paymentMethod === 'account_balance' 
        ? `Total of $${total.toFixed(2)} has been added to your account balance.`
        : `Payment of $${total.toFixed(2)} processed using your registered card.`;

      addToast({
        title: 'Order Placed Successfully!',
        description: `Your order has been placed. ${paymentMessage}`,
        variant: 'success',
        duration: 7000
      });

      // Navigate after delay
      setTimeout(() => {
        navigate('/profile?tab=orders');
      }, 2500); // Wait 2.5 seconds before navigating
      
    

    } catch (err: any) {
      console.error('Error placing order:', err);
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.error || errorMessage;
      }

      addToast({
        title: 'Order Failed',
        description: errorMessage,
        variant: 'error',
        duration: 5000
      });
      
      // Reset redirecting state on error
      setRedirecting(false);
    } finally {
      setOrderLoading(false);
    }
  };

  // Handle empty cart or loading (but not when redirecting after successful order)
  if ((cartLoading || !cart || cart.items.length === 0) && !redirecting) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="checkout" />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                {cartLoading ? 'Loading...' : 'Your Cart is Empty'}
              </h2>
              <p className="text-gray-600 mb-4">
                {cartLoading ? 'Loading your cart...' : 'Add some items to your cart before proceeding.'}
              </p>
              <Button onClick={() => navigate('/products')} className="w-full">
                Continue Shopping
              </Button>
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
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
            <p className="text-gray-600">Complete your shipping address and payment information</p>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart?.items?.map((item, index) => {
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
                    
                    {index < (cart?.items?.length || 0) - 1 && <hr className="my-3" />}
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

                <Button 
                  className="w-full mt-6" 
                  onClick={handlePlaceOrder}
                  disabled={orderLoading || cartLoading || redirecting}
                  size="lg"
                >
                  {orderLoading ? (
                    <>
                      <Package className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : redirecting ? (
                    <>
                      <Package className="mr-2 h-4 w-4 animate-pulse" />
                      Redirecting to Orders...
                    </>
                  ) : (
                    `Complete Order • $${total.toFixed(2)}`
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  By placing this order, you agree to our terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Shipping & Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    value={shippingAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="123 Main Street"
                    className={validationErrors.street ? 'border-red-500' : ''}
                  />
                  {validationErrors.street && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.street}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="Halifax"
                      className={validationErrors.city ? 'border-red-500' : ''}
                    />
                    {validationErrors.city && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Select 
                      value={shippingAddress.province} 
                      onValueChange={(value) => handleAddressChange('province', value)}
                    >
                      <SelectTrigger className={validationErrors.province ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NS">Nova Scotia</SelectItem>
                        <SelectItem value="ON">Ontario</SelectItem>
                        <SelectItem value="QC">Quebec</SelectItem>
                        <SelectItem value="BC">British Columbia</SelectItem>
                        <SelectItem value="AB">Alberta</SelectItem>
                        <SelectItem value="MB">Manitoba</SelectItem>
                        <SelectItem value="SK">Saskatchewan</SelectItem>
                        <SelectItem value="NL">Newfoundland and Labrador</SelectItem>
                        <SelectItem value="NB">New Brunswick</SelectItem>
                        <SelectItem value="PE">Prince Edward Island</SelectItem>
                        <SelectItem value="NT">Northwest Territories</SelectItem>
                        <SelectItem value="NU">Nunavut</SelectItem>
                        <SelectItem value="YT">Yukon</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.province && (
                      <p className="text-sm text-red-500 mt-1">{validationErrors.province}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    placeholder="B3H 4R2"
                    className={validationErrors.postalCode ? 'border-red-500' : ''}
                  />
                  {validationErrors.postalCode && (
                    <p className="text-sm text-red-500 mt-1">{validationErrors.postalCode}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                                          <SelectItem value="registered_card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Registered Card</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="account_balance">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Account Balance</span>
                        </div>
                      </SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {paymentMethod === 'registered_card' && (
                      <>
                        <CreditCard className="inline h-4 w-4 mr-1" />
                        Payment will be processed using your registered card on file.
                      </>
                    )}
                    {paymentMethod === 'account_balance' && (
                      <>
                        <Package className="inline h-4 w-4 mr-1" />
                        Order total will be added to your account balance for future payment.
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 