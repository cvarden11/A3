import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/authContext';
import { useToast } from '@/components/ui/toast';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  MapPin, 
  CreditCard, 
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle
} from 'lucide-react';
import axios from 'axios';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    imageUrl?: string;
  };
  name: string;
  quantity: number;
  priceAtPurchase: number;
  status: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  userId: string;
  shippingAddress: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentTransactionId?: string;
  paymentStatus: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetails() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      setError('Order ID is required');
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [orderId, user, navigate]);

  const fetchOrderDetails = async () => {
    if (!orderId || !user) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Order details:', response.data);
      setOrder(response.data);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 404) {
          setError('Order not found');
        } else if (err.response.status === 403) {
          setError('You are not authorized to view this order');
        } else {
          setError(`Failed to fetch order details: ${err.response.statusText}`);
        }
      } else {
        setError('Failed to fetch order details');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId || !order) return;

    // Check if order can be cancelled
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    if (!cancellableStatuses.includes(order.status.toLowerCase())) {
      addToast({
        title: 'Cannot Cancel Order',
        description: `Orders with status '${order.status}' cannot be cancelled.`,
        variant: 'error',
        duration: 4000
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to cancel order #${order.orderNumber}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setCancelLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/orders/${orderId}/cancel`,
        { reason: 'Customer requested cancellation' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order cancelled:', response.data);
      
      // Update the order state with the cancelled order
      setOrder(response.data.order);

      addToast({
        title: 'Order Cancelled',
        description: response.data.refundInfo 
          ? `Your order has been cancelled. ${response.data.refundInfo.status}`
          : 'Your order has been cancelled successfully.',
        variant: 'success',
        duration: 6000
      });

    } catch (err: any) {
      console.error('Error cancelling order:', err);
      
      let errorMessage = 'Failed to cancel order. Please try again.';
      if (axios.isAxiosError(err) && err.response) {
        errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
      }

      addToast({
        title: 'Cancellation Failed',
        description: errorMessage,
        variant: 'error',
        duration: 5000
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancelOrder = (status: string) => {
    const cancellableStatuses = ['pending', 'confirmed', 'processing'];
    return cancellableStatuses.includes(status.toLowerCase());
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleReorder = () => {
    if (!order) return;
    
    addToast({
      title: 'Reorder Functionality',
      description: 'Reorder feature will be implemented soon!',
      variant: 'info',
      duration: 3000
    });
  };

  const handleTrackOrder = () => {
    if (!order?.trackingNumber) return;
    
    addToast({
      title: 'Tracking Information',
      description: `Tracking number: ${order.trackingNumber}`,
      variant: 'info',
      duration: 5000
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="profile" />
        <main className="flex-grow flex items-center justify-center mt-16">
          <div className="text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header page="profile" />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="mx-auto h-16 w-16 text-red-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-gray-600 mb-4">
                {error || 'The order you are looking for could not be found.'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/profile?tab=orders')} className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Orders
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
      <Header page="profile" />
      <main className="flex-grow container mx-auto px-4 py-8 mt-16">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile?tab=orders')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(order.status)}
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <img
                        src={item.productId?.imageUrl || `https://placehold.co/80x80/cccccc/333333?text=${item.name.replace(/\s/g, '+')}`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">
                          ${item.priceAtPurchase.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </p>
                        <Badge className={getStatusColor(item.status)} variant="outline">
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Order Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  {order.status === 'delivered' && (
                    <Button onClick={handleReorder} variant="outline">
                      Reorder Items
                    </Button>
                  )}
                  {order.trackingNumber && (
                    <Button onClick={handleTrackOrder} variant="outline">
                      <Truck className="h-4 w-4 mr-2" />
                      Track Package
                    </Button>
                  )}
                  {canCancelOrder(order.status) && (
                    <Button 
                      variant="destructive"
                      onClick={handleCancelOrder}
                      disabled={cancelLoading}
                      className="flex items-center gap-2"
                    >
                      {cancelLoading ? (
                        <>
                          <Clock className="h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          Cancel Order
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-1">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                  <p>{order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Method:</span>
                    <span className="text-sm font-medium">
                      {order.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className={getStatusColor(order.paymentStatus)} variant="outline">
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  {order.paymentTransactionId && (
                    <div className="text-xs text-gray-500 mt-2">
                      Transaction ID: {order.paymentTransactionId}
                    </div>
                  )}
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