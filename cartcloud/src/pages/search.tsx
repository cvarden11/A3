import React, { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

enum Category {
  All = "all",
  Electronics = "electronics",
  Clothing = "clothing",
  Home = "home",
  Beauty = "beauty",
  Sports = "sports",
  Toys = "toys",
  Books = "books",
  Other = "other"
}

interface Product {
  _id: string;
  name: string;
  category?: Category;
  price: number;
  imageUrl: string;
  stock: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(Category.All);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);

  const handleSearch = async () => {
    const searchTerm = query.trim();

    // Basic validation: allow letters, numbers, spaces, hyphens, apostrophes and limiting length of search word
    const validPattern = /^[a-zA-Z0-9\s\-']+$/;
    if (searchTerm === '' || !validPattern.test(searchTerm) || searchTerm.length > 50) {
      setError('Please enter a valid search term.');
      setProducts([]);
      setHasSearched(true);
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<Product[]>(`${API_URL}/products`, {
        params: { q: searchTerm },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log("search data: " + data);
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || selectedCategory === Category.All
        ? true
        : product.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesPrice = maxPrice !== null ? product.price <= maxPrice : true;
    const matchesStock = inStockOnly ? (product.stock ?? 0) > 0 : true;
    return matchesCategory && matchesPrice && matchesStock;
  });


  return (

    <>
      {/* modal for filters */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="ml-2">Filters</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Products</DialogTitle>
            <DialogDescription>Refine your search results</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as Category)}
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>

            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Price ($)</label>
              <Input
                type="number"
                placeholder="Enter maximum price"
                value={maxPrice ?? ''}
                onChange={(e) => setMaxPrice(e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <label htmlFor="inStockOnly" className="text-sm">Only show products in stock</label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
            </DialogClose>
          </DialogFooter>
        </DialogContent>



        <div className="min-h-screen flex flex-col">
          <Header page="search" role="customer" />
          <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Search Products</h1>
            <div className="flex items-center justify-center gap-2 mb-10 max-w-lg mx-auto">
              <Input
                placeholder="Search for products..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleSearch}>Search</Button>
              <DialogTrigger asChild>
                <Button>Filters</Button>
              </DialogTrigger>
            </div>

            {loading && <p className="text-center text-gray-600">Searching...</p>}
            {error && <p className="text-center text-red-600">{error}</p>}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  to={`/product-details/${product._id}`}
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4 hover:shadow-lg transition-shadow"
                  state={{ product }}
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `https://placehold.co/200x200/cccccc/333333?text=${product.name.replace(/\\s/g, '+')}`;
                    }}
                  />
                  <h3 className="text-lg font-semibold text-gray-800 text-center">{product.name}</h3>
                  {product.category && <p className="text-sm text-gray-500 text-center mb-2">{product.category}</p>}
                  <p className="text-lg font-bold text-gray-900 text-center">${product.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
            {(!loading && hasSearched && products.length === 0) && (
              <p className="text-center text-gray-600 mt-10">No products found for "{query}"</p>
            )}
          </main>
          <Footer />
        </div>
      </Dialog>
    </>
  );
};

export default SearchPage; 