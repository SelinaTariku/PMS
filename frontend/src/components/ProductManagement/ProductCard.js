import React from 'react';

const ProductCard = ({ product, onClick, brandColor }) => {
  const { 
    name = 'Unnamed Product',
    sellingPrice = 0,
    discount = 0,
    quantity = 0,
    image = '',
    description = '',
    brand = '',
    categories = ''
  } = product || {};

  const calculateDiscount = (price, discount) => {
    return price - (price * discount / 100);
  };

  const discountedPrice = calculateDiscount(sellingPrice, discount);

  return (
    <div 
      className="border rounded-lg shadow-sm bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md flex flex-row h-56 min-w-[300px]" // Changed from h-48 to h-56
      onClick={onClick}
    >
      {/* Left Column - Image */}
      <div className="w-2/5 h-full bg-gray-100 flex items-center justify-center p-1">
        {image ? (
          <img 
            src={image} 
            alt={name}
            className="h-full w-full object-contain"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
          />
        ) : (
          <div className="text-gray-400 text-xs flex items-center justify-center h-full">
            <span>No Image Available</span>
          </div>
        )}
      </div>

      {/* Right Column - Details */}
      <div className="w-3/5 p-3 flex flex-col h-full overflow-hidden"> {/* Increased padding from p-2 to p-3 */}
        {/* Product name */}
        <h3 className="font-semibold text-sm mb-2 px-1 truncate w-full" title={name}>
          {name}
        </h3>
        
        {/* Description with more space */}
        <div className="text-xs text-gray-600 mb-3 px-1 line-clamp-3 h-14 overflow-hidden"> {/* Changed line-clamp-2 to 3 and increased height */}
          {description}
        </div>
        
        {/* Pricing information */}
        <div className="flex flex-wrap items-center gap-1 mb-3 px-1"> {/* Increased margin-bottom */}
          {discount > 0 ? (
            <>
              <span className="text-xs line-through text-gray-500">
                {sellingPrice.toFixed(2)} Birr
              </span>
              <span className="text-xs font-medium" style={{ color: brandColor }}>
                {discountedPrice.toFixed(2)} Birr
              </span>
              <span className="bg-green-100 text-green-800 text-[0.65rem] px-1 py-0.5 rounded">
                {discount}% OFF
              </span>
            </>
          ) : (
            <span className="text-xs font-medium" style={{ color: brandColor }}>
              {sellingPrice.toFixed(2)} Birr
            </span>
          )}
        </div>

        {/* Brand and quantity */}
        <div className="flex justify-between items-center text-[0.65rem] mb-3 px-1"> {/* Increased margin-bottom */}
          <div className="truncate pr-1">
            <span className="text-gray-500">Brand: </span>
            <span className="font-medium truncate" title={brand}>{brand || 'N/A'}</span>
          </div>
          <span className="text-gray-500 whitespace-nowrap">Qty: {quantity}</span>
        </div>

        {/* Category chip */}
        <div className="mb-3 px-1"> {/* Increased margin-bottom */}
          <span 
            className="inline-block bg-gray-100 text-gray-800 text-[0.65rem] px-2 py-0.5 rounded-full truncate max-w-full"
            title={categories}
          >
            {categories || 'Uncategorized'}
          </span>
        </div>

        {/* View Details button */}
        <div className="mt-auto px-1">
          <button 
            className="w-full py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity" {/* Increased button padding */}
            style={{ 
              backgroundColor: brandColor,
              color: 'white'
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;