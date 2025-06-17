import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CreateOrder from './CreateOrder';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [users, setUsers] = useState({});
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('orderId');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [sortField, setSortField] = useState('orderAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerDetails, setCustomerDetails] = useState(null);

  const branchId = localStorage.getItem('branches');
  const brandColor = localStorage.getItem('brandColor');
  const pharmacyId = localStorage.getItem('pharmacy');

  // Load cart items from localStorage
  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(savedCartItems);
  }, []);

  // Save cart items to localStorage
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Fetch orders and customers
  useEffect(() => {
    const fetchData = async () => {
      if (branchId) {
        try {
          // Fetch orders
          const ordersResponse = await axios.get(`http://localhost:5000/order/getOrderByBranchId/${branchId}`);
          setOrders(ordersResponse.data);
          setFilteredOrders(ordersResponse.data);
          await fetchUserDetails(ordersResponse.data);

          // Fetch customers
          const customersResponse = await axios.get('http://localhost:5000/users/getUsersByCustomerRole');
          setCustomers(customersResponse.data);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [branchId]);

  const fetchUserDetails = async (orders) => {
    const userPromises = orders.map(async (order) => {
      if (order.orderedBy && !users[order.orderedBy]) {
        try {
          const userResponse = await axios.get(`http://localhost:5000/users/getUserById/${order.orderedBy}`);
          setUsers((prevUsers) => ({
            ...prevUsers,
            [order.orderedBy]: userResponse.data,
          }));
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    });
    await Promise.all(userPromises);
  };

  // Sort orders
  useEffect(() => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      const compareField = (fieldA, fieldB) => (sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA);
      if (sortField === 'orderAt') {
        return compareField(new Date(a.orderAt), new Date(b.orderAt));
      } else if (sortField === 'totalAmount') {
        return compareField(a.totalAmount, b.totalAmount);
      } else if (sortField === 'status') {
        return sortOrder === 'asc' ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
      }
      return 0;
    });

    setFilteredOrders(sortedOrders);
  }, [sortField, sortOrder, orders]);

  const handleOrderAction = async (orderId, action) => {
    try {
      const response = await axios.put(`http://localhost:5000/order/acceptRejectOrder/${orderId}`, {
        status: action === 'accept' ? 'Accepted' : 'Rejected',
      });
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      setFilteredOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      setResponseMessage(response.data.message);
      setShowResponseModal(true);
      setShowConfirmationModal(false);
    } catch (error) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} order:`, error);
      setResponseMessage('Failed to process the order. Please try again.');
      setShowResponseModal(true);
    }
  };

  const showConfirmation = (orderId, action) => {
    setSelectedOrderId(orderId);
    setSelectedAction(action);
    setShowConfirmationModal(true);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setSelectedOrderId(null);
    setSelectedAction(null);
  };

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    const filtered = orders.filter((order) => {
      const orderByUser = users[order.orderedBy] || {};
      const userEmail = orderByUser.email ? orderByUser.email.toLowerCase() : '';
      const userPhone = orderByUser.phone ? orderByUser.phone.toLowerCase() : '';

      switch (searchField) {
        case 'orderId':
          return order._id.toLowerCase().includes(searchValue);
        case 'userEmail':
          return userEmail.includes(searchValue);
        case 'userPhone':
          return userPhone.includes(searchValue);
        case 'status':
          return order.status.toLowerCase().includes(searchValue);
        case 'paymentType':
          return order.paymentType.toLowerCase().includes(searchValue);
        case 'paymentMethod':
          return order.paymentMethod.toLowerCase().includes(searchValue);
        default:
          return false;
      }
    });
    setFilteredOrders(filtered);
  };

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const existingItem = prevCartItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCartItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCartItems, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((cartItem) => cartItem._id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prevCartItems) =>
      prevCartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.sellingPrice * item.quantity;
      const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
      return total + (itemTotal - itemDiscount);
    }, 0);
  };

  const calculateTotalDiscount = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.sellingPrice * item.quantity;
      const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
      return total + itemDiscount;
    }, 0);
  };

  const handleCheckCustomer = async () => {
    if (!customerPhone) return;

    try {
      const response = await axios.get(`http://localhost:5000/users/getUserByPhone/${customerPhone}`);
      setCustomerDetails(response.data);
    } catch (error) {
      setCustomerDetails(null);
    }
  };

  const handleOrderCartItems = async () => {
    if (!customerPhone) {
      setResponseMessage('Please enter customer phone number');
      setShowResponseModal(true);
      return;
    }

    try {
      const orderData = {
        products: cartItems.map((item) => ({
          productId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.sellingPrice,
          discount: item.discount || 0,
        })),
        userLocation: {
          lat: 0,
          lng: 0,
        },
        totalAmount: calculateTotal(),
        branchId: branchId,
        status: 'Accepted',
        pharmacyId: pharmacyId,
        orderedBy: localStorage.getItem('id'),
        orderedFor: customerDetails ? customerDetails._id : customerPhone,
        paymentType: 'In Advance',
        paymentMethod: 'Cash',
      };

      const response = await axios.post('http://localhost:5000/order/createOrder', orderData);
      setResponseMessage('Order placed successfully!');
      setShowResponseModal(true);
      setCartItems([]);
      localStorage.removeItem('cartItems');
      setShowPhoneModal(false);
      setCustomerPhone('');
      setCustomerDetails(null);
    } catch (error) {
      console.error('Error placing order:', error);
      setResponseMessage('Failed to place order. Please try again.');
      setShowResponseModal(true);
    }
  };

  const ResponseModal = ({ message, onClose }) => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Response</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-white font-semibold"
            style={{ backgroundColor: brandColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container max-h-80 min-h-80 pb-20 p-4">
      {/* Cart Button - Top Right */}
      <button
        onClick={toggleCart}
        className="fixed right-6 bottom-24 z-50 flex items-center justify-center w-12 h-12 rounded-full shadow-lg hover:shadow-xl transition-all"
        style={{ backgroundColor: brandColor }}
      >
        <FaShoppingCart className="text-white text-xl" />
        {totalCartItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalCartItems}
          </span>
        )}
      </button>

      {/* Compact Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-40 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleCart}></div>
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="relative w-screen max-w-xs mt-20 mb-20">
              <div className="h-full flex flex-col bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold" style={{ color: brandColor }}>Your Cart</h2>
                    <button
                      onClick={toggleCart}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="h-5 w-5" style={{ color: brandColor }} />
                    </button>
                  </div>

                  {cartItems.length > 0 ? (
                    <div className="mt-6">
                      <div className="flow-root">
                        <ul className="-my-4 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={item._id} className="py-4 flex">
                              <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden">
                                <img
                                  src={item.image || 'https://via.placeholder.com/150'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="ml-3 flex-1 flex flex-col">
                                <div>
                                  <div className="flex justify-between text-sm font-medium text-gray-900">
                                    <h3 className="truncate">{item.name}</h3>
                                    <p className="ml-2 whitespace-nowrap">
                                      {((item.sellingPrice * item.quantity) -
                                        ((item.sellingPrice * item.quantity * (item.discount || 0)) / 100).toFixed(2))} Birr
                                    </p>
                                  </div>
                                  {item.discount > 0 && (
                                    <p className="text-xs text-red-500">
                                      {item.discount}% off
                                    </p>
                                  )}
                                </div>

                                <div className="flex-1 flex items-end justify-between text-xs">
                                  <div className="flex items-center border rounded-md">
                                    <button
                                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                                    >
                                      -
                                    </button>
                                    <span className="px-2">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                                    >
                                      +
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => removeFromCart(item._id)}
                                    className="font-medium text-red-600 hover:text-red-500 text-xs"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 text-center">
                      <svg
                        className="mx-auto h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <h3 className="mt-2 text-md font-medium text-gray-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Start adding some products to your cart
                      </p>
                    </div>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="border-t border-gray-200 py-4 px-3">
                    <div className="flex justify-between text-sm font-medium text-gray-900">
                      <p>Subtotal</p>
                      <p>{calculateTotal().toFixed(2)} Birr</p>
                    </div>
                    <div className="flex justify-between text-xs text-red-500">
                      <p>Discount</p>
                      <p>-{calculateTotalDiscount().toFixed(2)} Birr</p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setShowPhoneModal(true)}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                        style={{ backgroundColor: brandColor }}
                      >
                        Checkout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phone Number Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4" style={{ color: brandColor }}>Customer Information</h2>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <div className="flex">
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter customer phone number"
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleCheckCustomer}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-r hover:bg-gray-300"
                >
                  Check
                </button>
              </div>
            </div>

            {customerDetails && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">Customer Found:</h3>
                <p><span className="font-medium">Name:</span> {customerDetails.name}</p>
                <p><span className="font-medium">Email:</span> {customerDetails.email}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <button
                onClick={() => {
                  setShowPhoneModal(false);
                  setCustomerPhone('');
                  setCustomerDetails(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderCartItems}
                disabled={!customerPhone}
                className={`px-4 py-2 text-white rounded ${!customerPhone ? 'bg-gray-400' : ''}`}
                style={{ backgroundColor: customerPhone ? brandColor : '' }}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!showCart && (
        <>
          {!showCreateOrder ? (
            <>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <h1 className="text-2xl font-bold mb-4 md:mb-0" style={{ color: brandColor }}>Orders</h1>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="orderId">Order ID</option>
                    <option value="userEmail">User Email</option>
                    <option value="userPhone">User Phone</option>
                    <option value="status">Status</option>
                    <option value="paymentType">Payment Type</option>
                    <option value="paymentMethod">Payment Method</option>
                  </select>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search..."
                    className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="orderAt">Order Date</option>
                    <option value="totalAmount">Total Amount</option>
                    <option value="status">Order Status</option>
                  </select>

                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>

                  <button
                    onClick={() => setShowCreateOrder(true)}
                    className="px-4 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: brandColor }}
                  >
                    New Order
                  </button>
                </div>
              </div>

              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOrders.map((order) => {
                    const user = users[order.orderedBy];
                    const isExpanded = expandedOrderId === order._id;

                    return (
                      <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="p-5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500">#{order._id.slice(-6)}</p>
                              <p className="text-lg font-semibold mt-1">
                                {user ? user.name : 'Customer'}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-s rounded-full ${order.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}
                            >
                              Order Status: {order.status}
                            </span>
                          </div>

                          <div className="mt-4">
                            <span className="py-1 text-s rounded-full font-bold" style={{ color: brandColor }}>
                              Payment Status: {order.paymentStatus}
                            </span>
                            <p className="text-gray-600">
                              <span className="font-medium">Date:</span> {new Date(order.orderAt).toLocaleString()}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Amount:</span> {order.totalAmount.toFixed(2)} Birr
                            </p>
                            {user && (
                              <p className="text-gray-600">
                                <span className="font-medium">Phone:</span> {user.phone}
                              </p>
                            )}
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="mb-3">
                                <p className="font-medium">Payment:</p>
                                <p>{order.paymentType} • {order.paymentMethod}</p>
                              </div>

                              <div>
                                <p className="font-medium">Products:</p>
                                <ul className="mt-2 space-y-2">
                                  {order.products.map((product) => (
                                    <li key={product._id} className="text-sm text-gray-600">
                                      {product.quantity}x {product.name} - {product.price} Birr
                                      {product.discount > 0 && (
                                        <span className="text-red-500 ml-2">({product.discount}% off)</span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 flex justify-between items-center">
                            <button
                              onClick={() => toggleExpandOrder(order._id)}
                              className="text-sm flex items-center text-blue-600 hover:text-blue-800"
                            >
                              {isExpanded ? (
                                <>
                                  <span>Show less</span>
                                  <FaChevronUp className="ml-1" size={12} />
                                </>
                              ) : (
                                <>
                                  <span>Show more</span>
                                  <FaChevronDown className="ml-1" size={12} />
                                </>
                              )}
                            </button>

                            {order.status === 'Pending' && (
                              <div className="flex space-x-2 mt-3">
                                <button
                                  onClick={() => showConfirmation(order._id, 'accept')}
                                  className="px-3 py-1 text-sm rounded-md text-white bg-green-600 hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => showConfirmation(order._id, 'reject')}
                                  className="px-3 py-1 text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'No orders have been placed yet'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <CreateOrder
              onClose={() => setShowCreateOrder(false)}
              onAddToCart={addToCart}
              customers={customers}
            />
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">
              Are you sure you want to {selectedAction === 'accept' ? 'accept' : 'reject'} this order?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeConfirmationModal}
                className="px-4 py-2 rounded-md text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOrderAction(selectedOrderId, selectedAction)}
                className={`px-4 py-2 rounded-md text-white font-medium ${selectedAction === 'accept' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {selectedAction === 'accept' ? 'Accept' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <ResponseModal
          message={responseMessage}
          onClose={() => setShowResponseModal(false)}
        />
      )}
    </div>
  );
};

export default OrderManagement;