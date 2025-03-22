import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateOrder = ({ onClose, onAddToCart, onOrderProduct }) => {
  const [products, setProducts] = useState([]); // State to store products
  const [filteredProducts, setFilteredProducts] = useState([]); // State to store filtered products
  const [searchTerm, setSearchTerm] = useState(''); // State to store search term
  const [expandedProductId, setExpandedProductId] = useState(null); // State to track expanded product
  const branchId = localStorage.getItem('branches'); // Get branch ID from localStorage
  const brandColor = localStorage.getItem('brandColor'); // Get brand color from localStorage

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/getProductByBranchaId/${branchId}`);
        setProducts(response.data); // Set the fetched products
        setFilteredProducts(response.data); // Initialize filtered products
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [branchId]);

  // Toggle expanded state for a product
  const toggleExpand = (productId) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  // Handle search input change
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter((product) =>
      Object.values(product).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(term)
      )
    );
    setFilteredProducts(filtered);
  };

  // Calculate discounted price if a discount exists
  const calculateDiscountedPrice = (price, discount) => {
    if (discount > 0) {
      return price - (price * (discount / 100));
    }
    return price;
  };

  // Handle order button click
  const handleOrder = async (product) => {
    const isConfirmed = window.confirm(`Are you sure you want to order ${product.name}?`);
    if (isConfirmed) {
      try {
        const orderData = {
          products: [
            {
              productId: product._id,
              name: product.name,
              quantity: 1,
              price: product.sellingPrice,
              discount: product.discount,
            }
          ],
          totalAmount: calculateDiscountedPrice(product.sellingPrice, product.discount),
          branchId: branchId,
          status: "Accepted",
          pharmacyId: product.pharmacy,
          userLocation: {
            lat: 0,
            lng: 0,
          },
          orderedBy: localStorage.getItem('id'),
          paymentType: 'In Advance',
          paymentMethod: 'Cash',
        };

        const response = await axios.post('http://localhost:5000/order/createOrder', orderData);
        alert(`Order placed successfully! Order ID: ${response.data._id}`);
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto pb-4">
      {/* Back Button and Search Section */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-white rounded-md shadow transition duration-200"
          style={{ background: brandColor }}
        >
          Back
        </button>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Product List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
          >
            {/* Flex container for image and details */}
            <div className="flex">
              {/* Left Section: Image */}
              <div className="w-1/2 p-2 flex items-center justify-center">
                <div className="w-28 h-28 relative overflow-hidden border-2 border-gray-200 rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right Section: Details */}
              <div className="w-1/2 p-2">
                <p className="text-gray-600 mb-1"><strong>Name:</strong> {product.name}</p>

                {/* Display actual price with a line through it and discounted price */}
                <p className="text-gray-600 mb-1">
                  <strong>Price:</strong>{" "}
                  {product.discount > 0 ? (
                    <>
                      <del>{product.sellingPrice} Birr</del>{" "}
                      <span className="text-green-600">
                        {calculateDiscountedPrice(product.sellingPrice, product.discount).toFixed(2)} Birr
                      </span>
                    </>
                  ) : (
                    <span>{product.sellingPrice} Birr</span>
                  )}
                </p>

                {/* Display discount percentage if applicable */}
                {product.discount > 0 && (
                  <p className="text-red-500 mb-1">
                    <strong>Discount:</strong> {product.discount}%
                  </p>
                )}

                <p className="text-gray-600 mb-1"><strong>Quantity:</strong> {product.quantity}</p>

                {/* Additional Details (Hidden by Default) */}
                {expandedProductId === product._id && (
                  <div>
                    <p className="text-gray-600 mb-1"><strong>Description:</strong> {product.description}</p>
                    <p className="text-gray-600 mb-1"><strong>Brand:</strong> {product.brand}</p>
                    <p className="text-gray-600 mb-1"><strong>Dosage:</strong> {product.dosage} {product.dosageUnit}</p>
                    <p className="text-gray-600 mb-1"><strong>Expired Date:</strong> {product.expirationDate[0].expiredDate}</p>
                  </div>
                )}

                {/* See More / See Less Button */}
                <button
                  onClick={() => toggleExpand(product._id)}
                  className="text-white px-1 py-1 rounded-md mt-2"
                  style={{ color: brandColor }}
                >
                  {expandedProductId === product._id ? 'See Less' : 'See More'}
                </button>

                {/* Add to Cart Button */}
                <button
                  onClick={() => onAddToCart(product)} // Add product to cart
                  className="text-white px-4 py-2 rounded-md mt-2 w-full"
                  style={{ backgroundColor: brandColor }}
                >
                  Add to Cart
                </button>

                {/* Order Button */}
                <button
                  onClick={() => handleOrder(product)}
                  className="text-white px-4 py-2 rounded-md mt-2 w-full"
                  style={{ backgroundColor: brandColor }}
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateOrder;