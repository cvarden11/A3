import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/product'; // Import Product from the central file

interface ProductCardProps {
  product: Product;
  showCategory?: boolean;
  showRemoveButton?: boolean;
  onRemove?: (id: string) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void; // New prop for delete action
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showCategory = true,
  showRemoveButton = false,
  onRemove,
  onEdit,
  onDelete // Destructure the new onDelete prop
}) => {
  // Handle both _id and id properties
  const productId = product._id || product.id || '';

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation to prevent link from being triggered
    if (onRemove && productId) {
      onRemove(productId);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation to prevent link from being triggered
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    e.stopPropagation(); // Stop event propagation to prevent link from being triggered
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col items-center p-4 hover:shadow-lg transition-shadow">
      {/* The Link wraps the product image and details for navigation */}
      <Link
        to={`/product-details/${productId}`}
        state={{ product }}
        className="w-full flex flex-col items-center flex-grow" // Ensure link takes available space
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          // Changed object-cover to object-contain to fit the image within the space
          className="w-full h-48 object-contain rounded-md mb-4"
          onError={(e) => {
            // Fallback image in case the original image fails to load
            (e.currentTarget as HTMLImageElement).src = `https://placehold.co/200x200/cccccc/333333?text=${product.name.replace(/\s/g, '+')}`;
          }}
        />
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {product.name}
        </h3>
        {showCategory && product.category && (
          <p className="text-sm text-gray-500 text-center mb-2">{product.category}</p>
        )}
        <p className="text-lg font-bold text-gray-900 text-center">
          ${product.price.toFixed(2)}
        </p>
      </Link>

      {/* Buttons are placed outside the Link to prevent conflict */}
      <div className="flex flex-col gap-2 mt-4 w-full px-2"> {/* Added padding for better spacing */}
        {onEdit && ( // Only show edit button if onEdit prop is provided
          <Button
            variant="default"
            className="w-full bg-black hover:bg-indigo-700 text-white" // Changed color back to indigo for consistency with previous versions
            onClick={handleEditClick}
          >
            Edit Product
          </Button>
        )}
        {onDelete && ( // Only show delete button if onDelete prop is provided
          <Button
            variant="destructive" // Tailwind's red color for destructive actions
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={handleDeleteClick}
          >
            Delete Product
          </Button>
        )}
        {showRemoveButton && onRemove && (
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleRemoveClick}
          >
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
