import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaShoppingCart } from 'react-icons/fa'; // Import cart icon
import CreateOrder from './CreateOrder'; // Import the CreateOrder component

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [users, setUsers] = useState({}); // Store user details by userId
  const [searchTerm, setSearchTerm] = useState(''); // State to manage search input
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track which order is expanded
  const [sortField, setSortField] = useState('orderAt'); // Field to sort by
  const [sortOrder, setSortOrder] = useState('desc'); // Sorting order (asc or desc)
  const [showCreateOrder, setShowCreateOrder] = useState(false); // Control visibility of CreateOrder section
  const [cartItems, setCartItems] = useState([]); // State to store cart items
  const [showCart, setShowCart] = useState(false); // State to control cart visibility
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State to control confirmation modal
  const [selectedOrderId, setSelectedOrderId] = useState(null); // Store the selected order ID for confirmation
  const [selectedAction, setSelectedAction] = useState(null); // Store the selected action (accept/reject)
  const [showResponseModal, setShowResponseModal] = useState(false); // State to control response modal visibility
  const [responseMessage, setResponseMessage] = useState(''); // State to store the API response message
  const branchId = localStorage.getItem('branches');
  const brandColor = localStorage.getItem('brandColor'); // Retrieve brandColor from localStorage

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    setCartItems(savedCartItems);
  }, []);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Clear cart data on browser refresh (optional)
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('cartItems'); // Clear cart data on refresh
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Fetch orders from the API
  useEffect(() => {
    const fetchOrders = async () => {
      if (branchId) {
        try {
          const response = await axios.get(`http://localhost:5000/order/getOrderByBranchId/${branchId}`);
          setOrders(response.data);
          setFilteredOrders(response.data); // Initialize filtered orders with all orders

          // Fetch user details for each order's "orderedBy" userId
          response.data.forEach(async (order) => {
            if (order.orderedBy && !users[order.orderedBy]) {
              try {
                const userResponse = await axios.get(`http://localhost:5000/users/getUserById/${order.orderedBy}`);
                setUsers((prevUsers) => ({
                  ...prevUsers,
                  [order.orderedBy]: userResponse.data, // Store user details by userId
                }));
              } catch (error) {
                console.error('Error fetching user details:', error);
              }
            }
          });
        } catch (error) {
          console.error('Error fetching orders:', error);
        }
      }
    };

    fetchOrders();
  }, [branchId, users]); // Re-run when users state changes

  // Sort orders whenever sortField or sortOrder changes
  useEffect(() => {
    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (sortField === 'orderAt') {
        const dateA = new Date(a.orderAt);
        const dateB = new Date(b.orderAt);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'totalAmount') {
        return sortOrder === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
      } else if (sortField === 'status') {
        return sortOrder === 'asc'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });

    setFilteredOrders(sortedOrders);
  }, [sortField, sortOrder, orders]); // Re-sort when sortField, sortOrder, or orders change

  // Handle order action (accept/reject)
  const handleOrderAction = async (orderId, action) => {
    try {
      const response = await axios.put(
        `http://localhost:5000/order/acceptRejectOrder/${orderId}`,
        { status: action === 'accept' ? 'accepted' : 'rejected' }
      );

      // Update orders based on response or local state
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      setFilteredOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));

      // Set the API response message and show the response modal
      setResponseMessage(response.data.message);
      setShowResponseModal(true);

      // Close the confirmation modal
      setShowConfirmationModal(false);
    } catch (error) {
      console.error(`Error ${action === 'accept' ? 'accepting' : 'rejecting'} order:`, error);
      setResponseMessage('Failed to process the order. Please try again.');
      setShowResponseModal(true);
    }
  };

  // Show confirmation modal for order action
  const showConfirmation = (orderId, action) => {
    setSelectedOrderId(orderId);
    setSelectedAction(action);
    setShowConfirmationModal(true);
  };

  // Close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setSelectedOrderId(null);
    setSelectedAction(null);
  };

  // Handle search input
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);

    // Filter orders based on search term in multiple fields
    const filtered = orders.filter((order) => {
      const orderByUser = users[order.orderedBy] || {};
      const userEmail = orderByUser.email ? orderByUser.email.toLowerCase() : '';
      const userPhone = orderByUser.phone ? orderByUser.phone.toLowerCase() : '';

      return (
        order._id.toLowerCase().includes(searchValue) || // Search by order ID
        userEmail.includes(searchValue) || // Search by user's email
        userPhone.includes(searchValue) || // Search by user's phone
        order.status.toLowerCase().includes(searchValue) || // Search by order status
        order.paymentType.toLowerCase().includes(searchValue) || // Search by payment type
        order.paymentMethod.toLowerCase().includes(searchValue) // Search by payment method
      );
    });

    setFilteredOrders(filtered);
  };

  // Toggle expanded order details
  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  // Add an item to the cart
  const addToCart = (product) => {
    setCartItems((prevCartItems) => {
      const existingItem = prevCartItems.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCartItems.map((item) =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCartItems, { ...product, quantity: 1 }]; // Ensure discount is included
      }
    });
  };

  // Remove an item from the cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => prev.filter((cartItem) => cartItem._id !== itemId));
  };

  // Decrease the quantity of an item in the cart
  const decreaseQuantity = (itemId) => {
    setCartItems((prevCartItems) => {
      const updatedCartItems = prevCartItems.map((item) => {
        if (item._id === itemId && item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      }).filter((item) => item.quantity > 0); // Remove items with zero quantity
      return updatedCartItems;
    });
  };

  // Toggle cart visibility
  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };

  // Calculate total quantity of items in the cart
  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate total discount for all items in the cart
  const calculateTotalDiscount = (cartItems) => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.sellingPrice * item.quantity;
      const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
      return total + itemDiscount;
    }, 0);
  };

  // Handle ordering all items in the cart
  const handleOrderCartItems = async () => {
    const isConfirmed = window.confirm('Are you sure you want to place this order?');
    if (isConfirmed) {
      try {
        // Calculate the total amount after applying discounts
        const totalAmount = cartItems.reduce((total, item) => {
          const itemTotal = item.sellingPrice * item.quantity;
          const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
          return total + (itemTotal - itemDiscount);
        }, 0);

        // Calculate the total discount
        const totalDiscount = calculateTotalDiscount(cartItems);

        const orderData = {
          products: cartItems.map((item) => ({
            productId: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.sellingPrice,
            discount: item.discount || 0,
          })),
          totalAmount: totalAmount, // Use the total amount after discounts
          totalDiscount: totalDiscount, // Add total discount to the order
          branchId: branchId,
          status: 'Pending',
          pharmacyId: cartItems[0]?.pharmacy || '', // Assuming all items belong to the same pharmacy
          userLocation: {
            lat: 0, // Replace with actual user location
            lng: 0, // Replace with actual user location
          },
          orderedBy: localStorage.getItem('id'),
          paymentType: 'In Advance',
          paymentMethod: 'Cash',
        };

        const response = await axios.post('http://localhost:5000/order/createOrder', orderData);
        alert(`Order placed successfully!`);

        // Clear the cart after successful order
        setCartItems([]);
        localStorage.removeItem('cartItems');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      }
    }
  };

  // Response Modal Component
  const ResponseModal = ({ message, onClose }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
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
  };

  return (
    <div className="container max-h-80 min-h-80 mb-10">
      {/* Cart Icon with Notification Badge */}
      <div className="fixed right-1 pl-5 mr-8 z-50">
        <div className="relative" onClick={toggleCart}>
          <FaShoppingCart className="text-3xl cursor-pointer" style={{ color: brandColor }} />
          {totalCartItems > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
              {totalCartItems}
            </span>
          )}
        </div>
      </div>

      {/* Show Cart Section when in Cart Mode */}
      {showCart ? (
        <div className="mb-8">
          <div className="flex items-left mb-4">
            <button
              onClick={toggleCart}
              className="px-2 py-1 rounded-md text-white font-semibold"
              style={{ backgroundColor: brandColor }}
            >
              Back
            </button>
            <h2 className="text-2xl font-bold ml-5" style={{ color: brandColor }}>Cart</h2>
          </div>
          {cartItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
                    <div className="p-6">
                      <p className="text-gray-800 font-semibold">{item.name}</p>
                      <p className="text-gray-600">Price: {item.sellingPrice} Birr</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => decreaseQuantity(item._id)} // Decrease quantity
                          className="py-1 px-4 rounded-md text-white font-semibold"
                          style={{ backgroundColor: '#ffa500' }}
                        >
                          -
                        </button>
                        <p className="text-gray-600">{item.quantity}</p> {/* Display quantity */}
                        <button
                          onClick={() => addToCart(item)} // Increase quantity
                          className="py-1 px-4 rounded-md text-white font-semibold"
                          style={{ backgroundColor: '#4caf50' }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item._id)} // Remove item from cart
                        className="mt-2 py-1 px-4 rounded-md text-white font-semibold"
                        style={{ backgroundColor: '#f44336' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary */}
              <div className="mt-6 flex justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: brandColor }}>Cart Summary</h2>
                  <div className="space-y-4">
                    {/* Display Cart Items */}
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between">
                        <p>{item.name}</p>
                        <p>{item.quantity} x {item.sellingPrice} Birr</p>
                      </div>
                    ))}

                    {/* Display Total Discount */}
                    <div className="flex justify-between">
                      <p className="font-semibold">Total Discount:</p>
                      <p className="text-red-500">
                        {calculateTotalDiscount(cartItems).toFixed(2)} Birr
                      </p>
                    </div>

                    {/* Display Total Amount */}
                    <div className="flex justify-between">
                      <p className="font-semibold">Total Amount:</p>
                      <p>
                        {cartItems.reduce((total, item) => {
                          const itemTotal = item.sellingPrice * item.quantity;
                          const itemDiscount = (itemTotal * (item.discount || 0)) / 100;
                          return total + (itemTotal - itemDiscount);
                        }, 0).toFixed(2)} Birr
                      </p>
                    </div>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={handleOrderCartItems}
                    className="mt-4 px-6 py-2 rounded-md text-white font-semibold w-full"
                    style={{ backgroundColor: brandColor }}
                  >
                    Order All Items
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Your cart is empty.</p>
          )}
        </div>
      ) : (
        <>
          {/* Show OrderManagement Section when not in Cart Mode */}
          {!showCreateOrder && (
            <>
              {/* Header, Search Input, Sorting Controls, and Create Order Button in a Single Row */}
              <div className="flex justify-between items-center mb-6 mr-12">
                <h1 className="text-2xl font-bold" style={{ color: brandColor }}>Pharmacy Orders</h1>
                <div className="flex items-left">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search Order"
                    className="w-34 px-2 py-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="px-2 py-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="orderAt">Order Date</option>
                    <option value="totalAmount">Total Amount</option>
                    <option value="status">Status</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="px-1 py-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                  <button
                    onClick={() => setShowCreateOrder(true)}
                    className="px-4 py-1 rounded-md text-white font-semibold"
                    style={{ backgroundColor: brandColor }}
                  >
                    Create Order
                  </button>
                </div>
              </div>

              {/* Orders List */}
              {filteredOrders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOrders.map((order) => {
                    const user = users[order.orderedBy]; // Get the user details for the order
                    const isExpanded = expandedOrderId === order._id; // Check if this order is expanded

                    return (
                      <div key={order._id} className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105">
                        <div className="p-6">
                          <p className="text-gray-600 mb-1"><strong>Order Date:</strong> {new Date(order.orderAt).toLocaleString()}</p>
                          <p className="text-gray-600 mb-1"><strong>Total Amount:</strong> {order.totalAmount} Birr</p>
                          <p className="text-gray-600 mb-1"><strong>Status:</strong> <span className="capitalize">{order.status}</span></p>
                          <p className="text-gray-600 mb-1"><strong>Ordered By:</strong> {user ? user.email : 'Loading user...'}</p>
                          <p className="text-gray-600 mb-1"><strong>Phone:</strong> {user ? user.phone : 'Loading phone...'}</p>

                          {/* Show additional fields if expanded */}
                          {isExpanded && (
                            <>
                              <p className="text-gray-600 mb-1"><strong>Payment Type:</strong> {order.paymentType}</p>
                              <p className="text-gray-600 mb-4"><strong>Payment Method:</strong> {order.paymentMethod}</p>

                              <div className="mb-4">
                                <h3 className="font-bold text-gray-800 mb-2">Ordered Products:</h3>
                                <ul className="list-disc ml-6 text-gray-700">
                                  {order.products.map((product) => (
                                    <li key={product._id} className="mb-1">
                                      <span>{product.name}</span> - <span>Quantity: {product.quantity}</span> - <span>Price: {product.price} Birr</span> (Discount: {product.discount}%)
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                          <button
                            onClick={() => toggleExpandOrder(order._id)}
                            className=" mt-4 py-1 px-2 rounded-md text-gray-700 font-semibold border border-gray-300 hover:bg-gray-100"
                          >
                            {isExpanded ? 'Show Less' : 'Show More'}
                          </button>
                          <div className="flex justify-between mt-4">
                            <button
                              onClick={() => showConfirmation(order._id, 'accept')}
                              className="py-1 px-4 rounded-md text-white font-semibold"
                              style={{ backgroundColor: brandColor }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => showConfirmation(order._id, 'reject')}
                              className="py-1 px-4 rounded-md text-white font-semibold"
                              style={{ backgroundColor: '#B52021' }}
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-600">No orders found for this branch.</p>
              )}
            </>
          )}

          {/* Show CreateOrder section when showCreateOrder is true */}
          {showCreateOrder && (
            <CreateOrder
              onClose={() => setShowCreateOrder(false)}
              onAddToCart={addToCart} // Pass the addToCart function
            />
          )}
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
            <p className="mb-4">Are you sure you want to {selectedAction} this order?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeConfirmationModal}
                className="px-4 py-2 rounded-md text-gray-700 font-semibold border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleOrderAction(selectedOrderId, selectedAction)}
                className="px-4 py-2 rounded-md text-white font-semibold"
                style={{ backgroundColor: selectedAction === 'accept' ? brandColor : '#f44336' }}
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