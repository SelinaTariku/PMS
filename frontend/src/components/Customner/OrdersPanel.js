import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSyncAlt, 
  faTimes, 
  faBoxOpen, 
  faBox, 
  faChevronUp, 
  faChevronDown, 
  faMapMarkerAlt 
} from '@fortawesome/free-solid-svg-icons';

const OrdersPanel = ({
  isOrdersOpen,
  setIsOrdersOpen,
  brandColor,
  ordersLoading,
  customerOrders,
  fetchCustomerOrders,
  expandedNotifications,
  handleNotificationClick,
  handleCancelOrder,
  ChapaprocessPayment,
  formatDate
}) => {
  const handleTrackOrder = async (order) => {
    try {
      if (!order.pharmacyId || !order.branchId) {
        alert('Order is missing pharmacy or branch information');
        return;
      }

      // Fetch pharmacy and branch details
      const [pharmacyRes, branchRes] = await Promise.all([
        fetch(`http://localhost:5000/pharmacies/getPharmacyById/${order.pharmacyId}`),
        fetch(`http://localhost:5000/branches/getBranchById/${order.branchId}`)
      ]);

      if (!pharmacyRes.ok || !branchRes.ok) {
        throw new Error('Failed to fetch location details');
      }

      const pharmacy = await pharmacyRes.json();
      const branch = await branchRes.json();

      if (!branch.location) {
        alert('Branch location information is not available');
        return;
      }

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // Calculate distance
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              branch.location.lat,
              branch.location.lng
            );

            // Show tracking information
            const userResponse = window.confirm(
              `You're ordering from: ${pharmacy.name}\n` +
              `Branch: ${branch.name}\n` +
              `Address: ${branch.location.address}\n\n` +
              `Distance: ${distance.toFixed(1)} km\n\n` +
              `Open in Google Maps for directions?`
            );

            if (userResponse) {
              const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${
                userLocation.lat},${userLocation.lng}&destination=${
                branch.location.lat},${branch.location.lng}&travelmode=driving`;
              window.open(mapsUrl, '_blank');
            }
          },
          (error) => {
            // Fallback without user location
            const userResponse = window.confirm(
              `You're ordering from: ${pharmacy.name}\n` +
              `Branch: ${branch.name}\n` +
              `Address: ${branch.location.address}\n\n` +
              `Open branch location in Google Maps?`
            );
            
            if (userResponse) {
              window.open(
                `https://www.google.com/maps/?q=${
                  branch.location.lat},${branch.location.lng}`,
                '_blank'
              );
            }
          }
        );
      } else {
        // Geolocation not supported
        const userResponse = window.confirm(
          `You're ordering from: ${pharmacy.name}\n` +
          `Branch: ${branch.name}\n` +
          `Address: ${branch.location.address}\n\n` +
          `Open branch location in Google Maps?`
        );
        
        if (userResponse) {
          window.open(
            `https://www.google.com/maps/?q=${
              branch.location.lat},${branch.location.lng}`,
            '_blank'
          );
        }
      }
    } catch (error) {
      console.error('Error tracking order:', error);
      alert('Failed to load tracking information. Please try again.');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  const OrderCard = ({ 
    order, 
    brandColor, 
    expandedNotifications, 
    handleNotificationClick, 
    handleTrackOrder, 
    handleCancelOrder, 
    ChapaprocessPayment 
  }) => {
    const [pharmacy, setPharmacy] = useState(null);
    const [branch, setBranch] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
      const fetchDetails = async () => {
        try {
          setLoadingDetails(true);
          
          const [pharmacyRes, branchRes] = await Promise.all([
            fetch(`http://localhost:5000/pharmacies/getPharmacyById/${order.pharmacyId}`),
            fetch(`http://localhost:5000/branches/getBranchById/${order.branchId}`)
          ]);

          if (pharmacyRes.ok) {
            const pharmacyData = await pharmacyRes.json();
            setPharmacy(pharmacyData);
          }

          if (branchRes.ok) {
            const branchData = await branchRes.json();
            setBranch(branchData);
          }
        } catch (error) {
          console.error("Error fetching order details:", error);
        } finally {
          setLoadingDetails(false);
        }
      };

      if (order.pharmacyId && order.branchId) {
        fetchDetails();
      }
    }, [order.pharmacyId, order.branchId]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        {/* Order Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-start">
            <div>
              {loadingDetails ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-bold" style={{color: brandColor}}>
                    {pharmacy?.name || "Pharmacy"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {branch?.name ? `${branch.name} Branch` : "Branch"}
                  </p>
                </>
              )}
              <p className="text-xs text-gray-700 font-medium mt-1 mb-1">
                {formatDate(order.createdAt)}
              </p>
              <h4 className="text-xs font-medium text-gray-700 mt-1 mb-1">
                {order.products.length} Items 
              </h4>
            </div>
            <div className="flex flex-col items-end">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                order.status === 'Accepted' || order.status === 'accepted' ? 'text-green-800 bg-green-100' : 
                order.status === 'Pending' ? 'text-red-800 bg-red-100' :
                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Order Status: {order.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium mt-1 ${
                order.paymentStatus === 'Pending' ? 'text-red-800 bg-red-100' :
                order.paymentStatus === 'paid' ? 'text-green-800 bg-green-100' :
                order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Payment Status: {order.paymentStatus}
              </span>
              <span className="mt-2 text-sm font-semibold" style={{ color: brandColor }}>
                Amount: {order.totalAmount.toFixed(2)} Birr
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="p-1">
          {expandedNotifications[order._id] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 pt-3 border-t border-gray-100 px-4"
            >
              <div className="space-y-3">
                <h4 className="text-sm font-medium" style={{color: brandColor}}>Order Items</h4>
                {order.products.map(product => (
                  <div key={product._id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FontAwesomeIcon icon={faBox} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-900">Qty: {product.quantity}</p>
                      </div>
                    </div>
                    <span className="font-medium">{(product.price * product.quantity).toFixed(2)} Birr</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-bold" style={{color: brandColor}}>Subtotal</span>
                  <span>{order.totalAmount.toFixed(2)} Birr</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 font-bold" style={{color: brandColor}}>Payment method</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                
                {!loadingDetails && branch?.location && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2" style={{color: brandColor}}>Branch Location</h4>
                    <p className="text-xs text-gray-600">{branch.location.address}</p>
                    {pharmacy?.contact && (
                      <p className="text-xs text-gray-600 mt-1">
                        Contact: {pharmacy.contact}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Order Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={() => handleNotificationClick(order._id)}
            className="text-xs flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            style={{color: brandColor}}
          >
            {expandedNotifications[order._id] ? (
              <>
                <FontAwesomeIcon icon={faChevronUp} className="mr-1" size="xs" style={{color: brandColor}} />
                Less details
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faChevronDown} className="mr-1" size="xs" style={{color: brandColor}} />
                More details
              </>
            )}
          </button>

          <div className="flex space-x-2">
            <button
              onClick={() => handleTrackOrder(order)}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
              style={{color: brandColor}}
              disabled={loadingDetails}
            >
              <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
              Track Order
            </button>
            {(order.status === 'Pending' || order.status === 'Accepted') && order.paymentStatus !== 'Paid' && (
              <button
                onClick={() => handleCancelOrder(order._id)}
                className="text-xs px-3 py-1.5 rounded-lg bg-red-500 text-white transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            {order.paymentStatus === 'Pending' && (order.status === 'Accepted' || order.status === 'accepted') && (
              <button
                onClick={() => ChapaprocessPayment(order)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: brandColor }}
              >
                {order.checkoutUrl ? 'Complete Payment' : 'Pay Now'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    isOrdersOpen && (
      <motion.div
        id="orders-panel"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-xl rounded-xl overflow-hidden z-20 border border-gray-100"
      >
        {/* Panel Header */}
        <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <h3 className="text-lg font-bold" style={{ color: brandColor }}>
            My Orders
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={fetchCustomerOrders}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Refresh orders"
            >
              <FontAwesomeIcon
                icon={faSyncAlt}
                className="text-sm"
                style={{ color: brandColor }}
              />
            </button>
            <button
              onClick={() => setIsOrdersOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Close panel"
            >
              <FontAwesomeIcon icon={faTimes} className="text-sm text-gray-500" />
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="max-h-96 overflow-y-auto p-2 bg-gray-50">
          {ordersLoading ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-3 border-b-2 mx-auto mb-4"
                style={{ borderColor: brandColor }}></div>
              <p className="text-sm" style={{ color: brandColor }}>Loading your orders...</p>
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="flex flex-col items-center p-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                <FontAwesomeIcon icon={faBoxOpen} className="text-2xl" style={{ color: brandColor }} />
              </div>
              <h4 className="font-medium text-gray-700">No orders found</h4>
              <p className="text-sm text-gray-500 mt-1">Your completed orders will appear here</p>
              <button 
                className="mt-3 px-4 py-2 text-sm rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {customerOrders.map(order => (
                <OrderCard 
                  key={order._id}
                  order={order}
                  brandColor={brandColor}
                  expandedNotifications={expandedNotifications}
                  handleNotificationClick={handleNotificationClick}
                  handleTrackOrder={handleTrackOrder}
                  handleCancelOrder={handleCancelOrder}
                  ChapaprocessPayment={ChapaprocessPayment}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )
  );
};

export default OrdersPanel;