// pages/vendor-products-page.tsx
import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import Footer from '@/components/footer';
import ProductCard from '@/components/product-card';
import EditProductModal from '@/components/edit-product-modal';
import ConfirmationModal from '@/components/confirmation-modal';
import axios from 'axios';
import { useAuth } from '@/context/authContext';
import type { Product } from '@/types/product'; // Import Product from the central file

const VendorProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // State for Delete Confirmation Modal
  const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // State for delete loading

  const { user } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Effect to load vendor products when user changes or component mounts
  useEffect(() => {
    const loadVendorProducts = async () => {
      // If user is not logged in or user ID is not available, stop loading and return
      if (!user || !user.id) {
        setLoading(false); // Ensure loading is set to false if no user is present
        return;
      }

      setError(null); // Clear any previous errors
      setLoading(true); // Set loading to true while fetching data

      try {
        // Fetch all products from the API
        const { data } = await axios.get<Product[]>(`${API_URL}/products`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token
          }
        });

        // Filter products to show only those belonging to the current vendor
        const vendorProducts = data.filter(product => product.vendorId === user.id);
        setProducts(vendorProducts); // Update products state
      } catch (err) {
        console.error("Error fetching products:", err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    loadVendorProducts();
  }, [user, API_URL]); // Dependencies: re-run only if user or API_URL changes
                        // Removed 'loading' from dependencies to prevent infinite loop

  // --- Handlers for Product Editing ---

  /**
   * Opens the edit modal with the selected product's data.
   * @param product The product object to be edited.
   */
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product); // Set the product to be edited
    setIsEditModalOpen(true);    // Open the edit modal
  };

  /**
   * Closes the edit modal and clears the selected product.
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);   // Close the edit modal
    setSelectedProduct(null);    // Clear the selected product
  };

  /**
   * Updates the product in the local state after a successful edit.
   * This avoids re-fetching all products from the API.
   * @param updatedProduct The product object with updated details.
   */
  const handleProductUpdated = (updatedProduct: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product._id === updatedProduct._id ? updatedProduct : product // Replace old product with updated one
      )
    );
  };

  // --- Handlers for Product Deletion ---

  /**
   * Opens the delete confirmation modal for a specific product.
   * @param product The product object to be deleted.
   */
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);         // Set the product to be deleted
    setIsDeleteConfirmModalOpen(true);   // Open the confirmation modal
  };

  /**
   * Executes the product deletion API call after user confirmation.
   */
  const handleConfirmDelete = async () => {
    // Ensure a product is selected for deletion and has an ID
    if (!productToDelete || !productToDelete._id) {
      setError('No product selected for deletion.');
      setIsDeleteConfirmModalOpen(false); // Close modal if no product is selected
      return;
    }

    setIsDeleting(true); // Set deleting state to true (for loading indicator on button)
    setError(null);      // Clear any previous errors

    try {
      // Send DELETE request to the API
      await axios.delete(`${API_URL}/products/${productToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Include auth token
        }
      });

      // Remove the deleted product from the local state
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product._id !== productToDelete._id)
      );

      setIsDeleteConfirmModalOpen(false); // Close the confirmation modal
      setProductToDelete(null);           // Clear the product to delete
    } catch (err) {
      console.error("Error deleting product:", err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false); // Set deleting state to false
    }
  };

  /**
   * Cancels the delete operation and closes the confirmation modal.
   */
  const handleCancelDelete = () => {
    setIsDeleteConfirmModalOpen(false); // Close the confirmation modal
    setProductToDelete(null);           // Clear the product to delete
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header page="vendor-products" />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12 mt-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Your Products</h1>
        {loading ? (
          <p className="text-gray-600">Loading your products...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">You have not listed any products yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={handleEditProduct}    // Pass handler for editing
                onDelete={handleDeleteProduct} // Pass handler for deleting
              />
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        product={selectedProduct}
        onProductUpdated={handleProductUpdated}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={
          productToDelete
            ? `Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this product? This action cannot be undone."
        }
        confirmText="Delete"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default VendorProductsPage;
