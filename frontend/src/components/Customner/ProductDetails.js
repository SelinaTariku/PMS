import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faStore, faHospital, faChevronDown, faChevronUp, faLocationDot } from '@fortawesome/free-solid-svg-icons';

const ProductDetails = ({ 
  product, 
  branchInfo, 
  pharmacyDetails, 
  onBack, 
  onAddToCart,
  brandColor 
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-xl shadow-md overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold" style={{ color: brandColor }}>{product.name}</h2>
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <div className="bg-gray-50 rounded-lg overflow-hidden h-64 flex items-center justify-center">
              <img 
                src={product.image || 'https://via.placeholder.com/300x300?text=No+Image'} 
                alt={product.name}
                className="h-full w-full object-contain p-4"
              />
            </div>
            
            <div className="mt-4 flex justify-center">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddToCart(product)}
                className="w-full py-3 rounded-xl font-medium shadow-md transition-all"
                style={{ 
                  backgroundColor: brandColor,
                  color: 'white'
                }}
              >
                Add to Cart
              </motion.button>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2" style={{ color: brandColor }}>Product Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Brand:</span> {product.brand || 'N/A'}</p>
                  <p><span className="font-medium">Category:</span> {product.categories || 'N/A'}</p>
                  <p><span className="font-medium">Dosage:</span> {product.dosage} {product.dosageUnit}</p>
                  <p><span className="font-medium">Status:</span> {product.status}</p>
                  <p><span className="font-medium">Quantity:</span> {product.quantity}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2" style={{ color: brandColor }}>Pricing</h3>
                <div className="space-y-2">
                  {product.discount > 0 ? (
                    <>
                      <p className="text-2xl font-bold" style={{ color: brandColor }}>
                        {(product.sellingPrice - (product.sellingPrice * product.discount / 100)).toFixed(2)} Birr
                      </p>
                      <p className="text-gray-500 line-through">
                        {product.sellingPrice.toFixed(2)} Birr
                      </p>
                      <p className="text-red-500 font-medium">
                        {product.discount}% OFF
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl font-bold" style={{ color: brandColor }}>
                      {product.sellingPrice.toFixed(2)} Birr
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: brandColor }}>Location Information</h3>
              <div className="space-y-3">
                {branchInfo && (
                  <div>
                    <div className="flex items-center mb-1">
                      <FontAwesomeIcon icon={faStore} className="mr-2" style={{ color: brandColor }} />
                      <span className="font-medium">Branch:</span>
                    </div>
                    <p className="ml-6">{branchInfo.name}</p>
                    {branchInfo.distance && (
                      <p className="ml-6 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faLocationDot} className="mr-1" />
                        {branchInfo.distance} km away
                      </p>
                    )}
                  </div>
                )}
                
                {pharmacyDetails && (
                  <div>
                    <div className="flex items-center mb-1">
                      <FontAwesomeIcon icon={faHospital} className="mr-2" style={{ color: brandColor }} />
                      <span className="font-medium">Pharmacy:</span>
                    </div>
                    <p className="ml-6">{pharmacyDetails.name}</p>
                    <p className="ml-6 text-sm text-gray-600">{pharmacyDetails.street}, {pharmacyDetails.city}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold" style={{ color: brandColor }}>Description</h3>
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-sm flex items-center"
                  style={{ color: brandColor }}
                >
                  {expanded ? 'Show Less' : 'Show More'}
                  <FontAwesomeIcon 
                    icon={expanded ? faChevronUp : faChevronDown} 
                    className="ml-1" 
                  />
                </button>
              </div>
              
              <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96' : 'max-h-20'}`}>
                <p className="text-gray-700">
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;