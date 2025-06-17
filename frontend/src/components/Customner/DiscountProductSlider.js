import React, { useEffect, useRef } from 'react';
import Slider from 'react-slick';
import { motion } from 'framer-motion';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const DiscountProductSlider = ({ products, onAddToCart }) => {
  const sliderRef = useRef(null);
  const brandColor = "#1E467A";

  useEffect(() => {
    if (!products || products.length === 0) return;

    const interval = setInterval(() => {
      if (sliderRef.current) {
        sliderRef.current.slickNext();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [products]);

  if (!products || products.length === 0) return null;

  const discountedProducts = products.filter(product => product.discount > 0);

  if (discountedProducts.length === 0) return null;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.max(3, discountedProducts.length), // Ensure at least 3
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(3, discountedProducts.length), // Show 3 or less depending on available products
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: Math.min(2, discountedProducts.length), // Show 2 on smaller screens
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1, // Show 1 on mobile
        }
      }
    ]
  };

  return (
    <div className="mb-2 px-4 py-2 rounded-2xl" style={{ background: `linear-gradient(135deg, ${brandColor}20, #ffffff)` }}>
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold" style={{ color: brandColor }}>Special Offers</h2>
        <div className="flex items-center">
          <span className="w-8 h-1 rounded-full mr-2" style={{ backgroundColor: brandColor }}></span>
          <span className="w-4 h-1 rounded-full" style={{ backgroundColor: `${brandColor}80` }}></span>
        </div>
      </div>

      <Slider ref={sliderRef} {...settings}>
        {discountedProducts.map(product => (
          <div key={product._id} className="px-2">
            <motion.div
              className="border border-gray-100 rounded-xl shadow-sm bg-white overflow-hidden h-full flex flex-col"
              whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative">
                <div className="h-32 bg-gray-50 flex items-center justify-center p-2">
                  <img
                    src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                {product.discount > 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {product.discount}% OFF
                  </div>
                )}
              </div>

              <div className="p-3 flex-grow flex flex-col">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm line-clamp-2">{product.name}</h3>

                <div className="mt-auto">
                  <div className="flex items-center mb-2">
                    <span className="text-md font-bold mr-1" style={{ color: brandColor }}>
                      {(product.sellingPrice - (product.sellingPrice * product.discount / 100)).toFixed(2)} Birr
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs line-through text-gray-400">
                        {product.sellingPrice.toFixed(2)} Birr
                      </span>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart(product)}
                    className="w-full py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: brandColor,
                      color: 'white'
                    }}
                  >
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default DiscountProductSlider;