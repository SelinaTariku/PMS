import React from 'react';

const ProductCard = ({ product, onClick, brandColor }) => {
  const calculateDiscountedPrice = (sellingPrice, discountPercentage) => {
    return sellingPrice - (sellingPrice * (discountPercentage / 100));
  };

  return (
    <div 
      className="border rounded-lg shadow-md bg-white flex p-4" 
      onClick={onClick} // Trigger the onClick for product details
    >
      <div className="w-32 h-32 mr-4 flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg border border-gray-300"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-lg font-bold">{product.name}</h2>
        <p className="text-gray-600">
          Price: 
          <span className="line-through text-gray-400">{product.sellingPrice} Birr</span>
          <span className="text-red-500"> {calculateDiscountedPrice(product.sellingPrice, product.discount).toFixed(2)} Birr</span>
          {product.discount && (
            <span className="text-green-500"> (Discount: {product.discount}%)</span>
          )}
        </p>
        <p className="text-sm text-gray-500">Stock: {product.stock}</p>
      </div>
    </div>
  );
};

export default ProductCard;