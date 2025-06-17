import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ProductCard = ({
  product,
  branchInfo,
  onProductClick,
  onAddToCart,
  onOrder,
  onToggleFavorite,
  isFavorite,
  brandColor,
  expandedProduct
}) => {
  console.log("Details: ",branchInfo)
  const isExpanded = expandedProduct === product._id;
  const discountedPrice = product.discount > 0 
    ? product.sellingPrice - (product.sellingPrice * product.discount / 100)
    : product.sellingPrice;

  return (
    <motion.div
      className="border border-gray-100 rounded-xl shadow-sm bg-white overflow-hidden"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div 
          className="h-48 bg-gray-50 flex items-center justify-center p-2 cursor-pointer"
          onClick={() => onProductClick(product._id)}
        >
          <img
            src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
            alt={product.name}
            className="h-full w-full object-contain"
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product._id);
          }}
          className="absolute top-2 left-2 p-2 rounded-full bg-white/80 backdrop-blur-sm"
        >
          <FontAwesomeIcon
            icon={faHeart}
            className={isFavorite ? "text-red-500" : "text-gray-300"}
          />
        </button>
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div className="p-4">
        <div 
          className="cursor-pointer"
          onClick={() => onProductClick(product._id)}
        >
          <h3 className="font-semibold text-gray-800 mb-1">{product.name}</h3>
       

        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            <span className="text-lg font-bold" style={{ color: brandColor }}>
              {discountedPrice.toFixed(2)} Birr
            </span>
            {product.discount > 0 && (
              <span className="text-xs line-through text-gray-400 ml-1">
                {product.sellingPrice.toFixed(2)} Birr
              </span>
            )}
          </div>

          <div className="flex space-x-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: brandColor,
                color: 'white'
              }}
            >
              <FontAwesomeIcon icon={faShoppingCart} className="mr-1" />
            </motion.button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600">{product.description}</p>
            <div className="flex justify-end mt-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOrder(product);
                }}
                className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                style={{
                  backgroundColor: brandColor,
                  color: 'white'
                }}
              >
                Order Now
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;