import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Header from '@/components/header';
import Footer from '@/components/footer';
import axios from 'axios';
import { HeartIcon } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { useToast } from '../components/ui/toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Defines the structure of product data.
interface Product {
  _id: string;
  name: string;
  price: number;
  currency?: string;
  imageUrl?: string;
  images?: string[];
  category?: string;
  variants?: { label: string; value: string }[];
  description?: {
    info?: string;
    details?: string;
    delivery?: string;
  };
  attributes?: {
    [key: string]: any;
  };
}

// Hardcoded product data; this will be replaced by a backend API call.
const fallbackProduct: Product = {
  _id: 'basic-t-shirt-123',
  name: 'Basic T-Shirt',
  price: 10,
  currency: '$',
  images: [
    'https://placehold.co/400x400/A0A0A0/333333?text=Main+Product+1',
    'https://placehold.co/400x400/B0B0B0/333333?text=Main+Product+2',
    'https://placehold.co/400x400/C0C0C0/333333?text=Main+Product+3',
    'https://placehold.co/400x400/D0D0D0/333333?text=Main+Product+4',
  ],
  variants: [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
  ],
  description: {
    info: 'Basic T-shirt with a relaxed fit makes it a versatile staple for everyday wear. Features a classic crew neck and clean hemline. Crafted from soft, breathable fabric for all-day comfort. Minimal design with subtle detailing for easy layering or stand-alone style.',
    details: 'This section would contain more technical details about the product, such as:',
    delivery: 'Information regarding delivery options and return policy:',
  },
  attributes: {
    material: '100% Cotton',
    fit: 'Relaxed',
    neckline: 'Crew Neck',
    care: 'Machine wash cold',
    fabricWeight: '180 GSM',
    stitching: 'Double-stitched seams',
    sleeveStyle: 'Short sleeve',
    origin: 'Made in Bangladesh',
    standardDelivery: '3-5 business days',
    expressDelivery: '1-2 business days',
    returnsPolicy: 'Free returns within 30 days of purchase.',
    returnCondition: 'Item must be unworn and in original condition with tags.',
  },
};

interface MessageModalProps {
  message: string;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center rounded-lg">
        <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
        <Button onClick={onClose} variant="secondary">Close</Button>
      </div>
    </div>
  );
};

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const { addToast } = useToast();

  // Product either passed through navigation state or will be fetched
  const [product, setProduct] = useState<Product | undefined>(
    (location.state as any)?.product as Product | undefined
  );
  const [loading, setLoading] = useState<boolean>(!product);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('info');
  const [modalMessage, setModalMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Backend base URL (fallback to localhost if env not set)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Use either fetched product or fallback demo product
  const productData: Product = (product ?? fallbackProduct);

  // Fetch product if needed
  useEffect(() => {
    if (product) {
      const firstImage = product.images?.[0] || product.imageUrl || '';
      setMainImage(firstImage);
      return;
    }

    if (!id) return;
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get<Product>(`${API_URL}/products/${id}`);
        setProduct(data);
        setSelectedVariant(data.variants?.[0]?.value ?? '');
        const firstImage = data.images?.[0] || data.imageUrl || '';
        setMainImage(firstImage);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, product]);

  // Fetch wishlist to determine if this product is already favorited
  useEffect(() => {
    const checkWishlist = async () => {
      if (!productData?._id || !user) return;
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${API_URL}/wishlists/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const exists = (data.items || []).some((item: any) => {
          const pid = item.productId?._id ?? item.productId;
          return pid === productData._id;
        });
        setIsFavorite(exists);
      } catch (err) {
        console.error('Failed to check wishlist', err);
      }
    };

    checkWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData._id, user]);

  // Toggle wishlist status
  const handleToggleWishlist = async () => {
    if (!user) {
      addToast({
        title: 'Login Required',
        description: 'Please log in to manage your wishlist.',
        variant: 'error',
        duration: 3000
      });
      return;
    }

    if (isFavorite) {
      // Remove from wishlist
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/wishlists/${user.id}/${productData._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsFavorite(false);
        addToast({
          title: 'Removed from Wishlist',
          description: `${productData.name} has been removed from your wishlist.`,
          variant: 'success',
          duration: 3000
        });
      } catch (err) {
        console.error(err);
        addToast({
          title: 'Error',
          description: 'Failed to remove from wishlist.',
          variant: 'error',
          duration: 3000
        });
      }
    } else {
      // Add to wishlist
      try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_URL}/wishlists/${user.id}`, { productId: productData._id }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setIsFavorite(true);
        addToast({
          title: 'Added to Wishlist',
          description: `${productData.name} has been added to your wishlist!`,
          variant: 'success',
          duration: 3000
        });
      } catch (err) {
        console.error(err);
        addToast({
          title: 'Error',
          description: 'Failed to add to wishlist.',
          variant: 'error',
          duration: 3000
        });
      }
    }
  };

  const handleVariantChange = (value: string) => {
    setSelectedVariant(value);
  };

  const handleAddToCart = async () => {
    if (!user) {
      addToast({
        title: 'Login Required',
        description: 'Please log in to add items to your cart.',
        variant: 'error',
        duration: 3000
      });
      return;
    }

    const success = await addToCart(productData._id, 1);
    
    if (success) {
      addToast({
        title: 'Added to Cart',
        description: `${productData.name} has been added to your cart!`,
        variant: 'success',
        duration: 3000
      });
    } else {
      addToast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'error',
        duration: 3000
      });
    }
  };

  const closeModal = () => {
    setModalMessage('');
  };

  if (loading) {
    return (
      <>
        <Header page="product-details" />
        <main className="flex-grow flex items-center justify-center mt-20">
          <p>Loading product...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header page="product-details" />
        <main className="flex-grow flex items-center justify-center mt-20">
          <p className="text-red-600">{error}</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header page="product-details" role="customer"/>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 md:p-8 flex flex-col lg:flex-row gap-4 lg:gap-8">
          <div className="flex flex-col lg:flex-row gap-4 w-full lg:w-2/5">
            <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-y-auto pb-2 lg:pb-0 justify-center flex-shrink-0 lg:w-24 lg:h-auto">
              {productData.images?.map((img, index) => (
                <div
                  key={index}
                  className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-md border border-gray-200 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors duration-200"
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`${productData.name} thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex-grow flex-shrink rounded-lg overflow-hidden border border-gray-200 w-full flex items-center justify-center">
              <img src={mainImage} alt={`Main image of ${productData.name}`} className="block w-full h-auto object-contain" />
            </div>
          </div>

          <div className="w-full lg:w-3/5 space-y-6 mt-6 lg:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{productData.name}</h1>
            <p className="text-2xl text-gray-700 font-semibold">{productData.currency ?? '$'}{productData.price}</p>

            <div className="space-y-2">
              <label htmlFor="product-variant" className="block text-gray-700 text-sm font-medium mb-1">Select Size:</label>
              <RadioGroup
                value={selectedVariant}
                onValueChange={handleVariantChange}
                className="grid grid-cols-3 sm:grid-cols-5 gap-2"
              >
                {(productData.variants ?? []).map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`variant-${option.value}`} />
                    <label htmlFor={`variant-${option.value}`} className="text-sm font-medium leading-none cursor-pointer">
                      {option.label}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Button 
                onClick={handleAddToCart} 
                className="w-full md:w-auto" 
                disabled={cartLoading}
              >
                {cartLoading ? 'Adding to Cart...' : 'Add to cart'}
              </Button>
              <button
                onClick={handleToggleWishlist}
                className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                aria-label="Add to wishlist"
              >
                <HeartIcon
                  className={isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}
                  size={22}
                />
              </button>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <div className="flex space-x-4 border-b border-gray-200 mb-4 overflow-x-auto whitespace-nowrap">
                <button
                  className={`py-2 px-4 text-sm font-medium rounded-t-md ${activeTab === 'info' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab('info')}
                >
                  Product Info
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium rounded-t-md ${activeTab === 'details' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab('details')}
                >
                  Details
                </button>
                <button
                  className={`py-2 px-4 text-sm font-medium rounded-t-md ${activeTab === 'delivery' ? 'text-gray-900 border-b-2 border-gray-900' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveTab('delivery')}
                >
                  Delivery & Returns
                </button>
              </div>

              {activeTab === 'info' && (
                <div className="text-gray-600 text-sm leading-relaxed p-2">
                  <p>{productData.description?.info}</p>
                  <ul className="list-disc list-inside mt-4 space-y-1">
                    <li>Material: {productData.attributes?.material}</li>
                    <li>Fit: {productData.attributes?.fit}</li>
                    <li>Neckline: {productData.attributes?.neckline}</li>
                    <li>Care: {productData.attributes?.care}</li>
                  </ul>
                </div>
              )}
              {activeTab === 'details' && (
                <div className="text-gray-600 text-sm leading-relaxed p-2">
                  <p>{productData.description?.details}</p>
                  <ul className="list-disc list-inside mt-4 space-y-1">
                    <li>Fabric Weight: {productData.attributes?.fabricWeight}</li>
                    <li>Stitching: {productData.attributes?.stitching}</li>
                    <li>Sleeve Style: {productData.attributes?.sleeveStyle}</li>
                    <li>Origin: {productData.attributes?.origin}</li>
                  </ul>
                </div>
              )}
              {activeTab === 'delivery' && (
                <div className="text-gray-600 text-sm leading-relaxed p-2">
                  <p>{productData.description?.delivery}</p>
                  <ul className="list-disc list-inside mt-4 space-y-1">
                    <li>Standard Delivery: {productData.attributes?.standardDelivery}</li>
                    <li>Express Delivery: {productData.attributes?.expressDelivery}</li>
                    <li>Returns: {productData.attributes?.returnsPolicy}</li>
                    <li>Return Condition: {productData.attributes?.returnCondition}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <MessageModal message={modalMessage} onClose={closeModal} />
      <Footer />
    </>
  );
};

export default ProductDetails;
