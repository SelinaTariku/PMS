import React, { useState, useEffect } from 'react';
import { FaArrowLeft } from "react-icons/fa";
import axios from 'axios';

const CreateOrder = ({ onClose, onAddToCart, customers }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [cartQuantities, setCartQuantities] = useState({});
  const [filteredCustomers, setFilteredCustomers] = useState(customers);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const id = localStorage.getItem('id');
  const branchId = localStorage.getItem('branches');
  const brandColor = localStorage.getItem('brandColor');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/products/getProductByBranchId/${branchId}`);
        const processedProducts = response.data.map(product => ({
          ...product,
          quantity: product.quantity || calculateQuantityFromExpiration(product.expirationDate),
        }));
        setProducts(processedProducts);
        setFilteredProducts(processedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        showResponse('Error fetching products', false);
      }
    };

    fetchProducts();
  }, [branchId]);

  useEffect(() => {
    setFilteredCustomers(customers);
  }, [customers]);

  const calculateQuantityFromExpiration = (expirationDates) => {
    if (!expirationDates || !Array.isArray(expirationDates)) return 0;
    return expirationDates.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const showResponse = (message, success) => {
    setResponseMessage(message);
    setIsSuccess(success);
    setShowResponseModal(true);
  };

  const toggleExpand = (productId) => {
    setExpandedProductId((prevId) => (prevId === productId ? null : productId));
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = products.filter((product) =>
      Object.values(product).some(
        (value) => typeof value === 'string' && value.toLowerCase().includes(term)
      )
    );
    setFilteredProducts(filtered);
  };

  const calculateDiscountedPrice = (price, discount) => {
    return discount > 0 ? price - (price * (discount / 100)) : price;
  };

  const handleOrder = (product) => {
    setCurrentProduct(product);
    setOrderQuantity(1);
    setShowPhoneInput(true);
    setShowCustomerList(true);
    setFilteredCustomers(customers);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= currentProduct.quantity) {
      setOrderQuantity(value);
    }
  };

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);

    const filtered = customers.filter(customer =>
      (customer.fullName?.toLowerCase().includes(value.toLowerCase()) ||
      customer.email?.toLowerCase().includes(value.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(value.toLowerCase())
    ));

    setFilteredCustomers(filtered);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setPhoneNumber(customer.phoneNumber || customer.email);
    setShowCustomerList(false);
  };

  const confirmOrder = async () => {
    if (orderQuantity > currentProduct.quantity) {
      showResponse(`Cannot order more than available quantity (${currentProduct.quantity})`, false);
      return;
    }

    try {
      const orderData = {
        products: [
          {
            productId: currentProduct._id,
            name: currentProduct.name,
            quantity: orderQuantity,
            price: currentProduct.sellingPrice,
            discount: currentProduct.discount,
          }
        ],
        totalAmount: calculateDiscountedPrice(currentProduct.sellingPrice, currentProduct.discount) * orderQuantity,
        branchId: branchId,
        status: "Accepted",
        pharmacyId: currentProduct.pharmacy,
        orderedBy: id,
        orderedReceivedBy: id,
        orderedReceivedAt: new Date(),
        orderedFor: selectedCustomer ? selectedCustomer._id : phoneNumber || 'Anonymous',
        paymentType: 'In Advance',
        paymentMethod: 'Cash',
        userLocation: {
          lat: 0,
          lng: 0,
        },
      };

      await axios.post('http://localhost:5000/order/createOrder', orderData);
      showResponse(`Order placed successfully for ${orderQuantity} item(s)!`, true);

      const updatedProducts = products.map(p =>
        p._id === currentProduct._id ? { ...p, quantity: p.quantity - orderQuantity } : p
      );

      setProducts(updatedProducts);
      setFilteredProducts(updatedProducts);

      setShowPhoneInput(false);
      setPhoneNumber('');
      setSelectedCustomer(null);
      setCurrentProduct(null);
      setOrderQuantity(1);
      setShowCustomerList(false);
    } catch (error) {
      console.error('Error placing order:', error);
      showResponse('Failed to place order. Please try again.', false);
    }
  };

  const handleAddToCart = (product) => {
    const currentQty = cartQuantities[product._id] || 0;
    if (currentQty < product.quantity) {
      const newQty = currentQty + 1;
      setCartQuantities({
        ...cartQuantities,
        [product._id]: newQty,
      });
      onAddToCart(product);
    }
  };

  return (
    <div className="container max-h-80 min-h-80 mb-10">
      <div className="flex items-center gap-4 mb-4">
        
         <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={onClose}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-6">
        {filteredProducts.map((product) => {
          const productCartQty = cartQuantities[product._id] || 0;
          const isOutOfStock = product.quantity <= 0;
          const isMaxedOut = productCartQty >= product.quantity;

          return (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105"
            >
              <div className="flex">
                <div className="w-1/2 p-2 flex items-center justify-center">
                  <div className="w-28 h-28 relative overflow-hidden border-2 border-gray-200 rounded-lg">
                    <img
                      src={product.image || 'https://via.placeholder.com/150?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                      }}
                    />
                  </div>
                </div>

                <div className="w-1/2 p-2">
                  <p className="text-gray-600 mb-1"><strong>Name:</strong> {product.name}</p>
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
                  {product.discount > 0 && (
                    <p className="text-red-500 mb-1">
                      <strong>Discount:</strong> {product.discount}%
                    </p>
                  )}
                  <p className="text-gray-600 mb-1">
                    <strong>Quantity:</strong>{" "}
                    <span className={isOutOfStock ? 'text-red-600' : 'text-green-600'}>
                      {product.quantity} available
                    </span>
                  </p>

                  {expandedProductId === product._id && (
                    <div>
                      <p className="text-gray-600 mb-1"><strong>Description:</strong> {product.description}</p>
                      <p className="text-gray-600 mb-1"><strong>Brand:</strong> {product.brand}</p>
                      <p className="text-gray-600 mb-1"><strong>Dosage:</strong> {product.dosage} {product.dosageUnit}</p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleExpand(product._id)}
                    className="text-sm mt-1"
                    style={{ color: brandColor }}
                  >
                    {expandedProductId === product._id ? 'See Less' : 'See More'}
                  </button>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock || isMaxedOut}
                    className={`text-white px-2 py-1 rounded-md mt-2 w-full ${isOutOfStock || isMaxedOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: brandColor }}
                  >
                    {isOutOfStock ? 'Out of Stock' : isMaxedOut ? 'Max Added' : 'Add to Cart'}
                  </button>

                  <button
                    onClick={() => handleOrder(product)}
                    disabled={isOutOfStock}
                    className={`text-white px-2 py-1 rounded-md mt-2 w-full ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: brandColor }}
                  >
                    Order Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Modal */}
      {showPhoneInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4" style={{color:brandColor}}>Customer Information</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Search by Name, Email or Phone</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={handleCustomerSearch}
                placeholder="Search..."
                className="w-full px-2 py-1 border border-gray-300 rounded"
                onFocus={() => setShowCustomerList(true)}
              />
            </div>

            {showCustomerList && (
              <div className="mb-4 max-h-60 overflow-y-auto border border-gray-200 rounded">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <div
                      key={customer._id}
                      onClick={() => selectCustomer(customer)}
                      className={`p-3 hover:bg-gray-100 cursor-pointer ${selectedCustomer?._id === customer._id ? 'bg-blue-50' : ''}`}
                    >
                      <div className="font-medium">{customer.fullName}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                      <div className="text-sm text-gray-600">{customer.phone}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 text-center">No customers found</div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                max={currentProduct?.quantity || 1}
                value={orderQuantity}
                onChange={handleQuantityChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <p className="text-sm text-gray-500 mt-1">Max available: {currentProduct?.quantity}</p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {selectedCustomer ? (
                  <>
                    <span className="font-medium">Selected: </span>
                    {selectedCustomer.fullName} ({selectedCustomer.email})
                  </>
                ) : (
                  "No customer selected (order will be anonymous)"
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPhoneInput(false);
                  setPhoneNumber('');
                  setSelectedCustomer(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmOrder}
                className="px-4 py-2 text-white rounded hover:opacity-90 transition"
                style={{ backgroundColor: brandColor }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className={`text-${isSuccess ? `${brandColor}` : 'red'}-500 mb-4`}>
              {responseMessage}
            </div>
            <button
              onClick={() => setShowResponseModal(false)}
              className="px-1 py-1 text-white rounded flex items-center justify-center"
              style={{ backgroundColor: brandColor }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;