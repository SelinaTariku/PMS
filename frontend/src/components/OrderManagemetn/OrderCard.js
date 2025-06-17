import React from 'react';
import { 
  FaChevronDown, 
  FaChevronUp,
  FaMapMarkerAlt,
  FaTruck
} from 'react-icons/fa';
import { 
  FiDollarSign, 
  FiCalendar, 
  FiClock,
  FiPackage,
} from 'react-icons/fi';
import { 
  BsCheckCircleFill, 
  BsXCircleFill,
  FiCheckCircle,
  BsExclamationCircleFill
} from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';

const OrderCard = ({ 
  order, 
  isExpanded, 
  isUnread, 
  statusColor, 
  toggleExpandOrder, 
  showConfirmation,
  brandColor
}) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden ${
        isUnread ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800 mr-2">
                #{order._id.slice(-6)}
              </span>
              <span 
                className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${statusColor.bg} ${statusColor.text}`}
              >
                <span className="mr-1">{statusColor.icon}</span>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                {order.paymentStatus === 'paid' && order.status !== 'delivered' && ' (Paid)'}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold">
              {order.orderedFor || 'Walk-in Customer'}
            </h3>
          </div>
          <button 
            onClick={() => toggleExpandOrder(order._id)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FiDollarSign className="mr-2 text-gray-400" />
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiCalendar className="mr-2 text-gray-400" />
            <span>{formatDate(order.orderAt)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FiClock className="mr-2 text-gray-400" />
            <span>{formatTime(order.orderAt)}</span>
          </div>
          {order.userLocation?.lat !== 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <FaMapMarkerAlt className="mr-2 text-gray-400" />
              <span>Location: {order.userLocation.lat.toFixed(4)}, {order.userLocation.lng.toFixed(4)}</span>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h4>
              <div className="flex items-center text-sm text-gray-600">
                <span className="capitalize">{order.paymentType}</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{order.paymentMethod}</span>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Products ({order.products.length})</h4>
              <ul className="space-y-3">
                {order.products.map((product) => (
                  <li key={product._id} className="flex items-start">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{product.dosage} {product.dosageunit}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>{product.quantity} × {formatCurrency(product.price)}</span>
                        {product.discount > 0 && (
                          <span className="ml-2 text-red-500">
                            ({product.discount}% off)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: {formatCurrency(product.price * product.quantity * (1 - (product.discount || 0)/100))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => showConfirmation(order._id, 'accept')}
                className="px-3 py-1.5 text-sm rounded-md text-white flex items-center"
                style={{ backgroundColor: brandColor }}
              >
                <BsCheckCircleFill className="mr-1" />
                Accept
              </button>
              <button
                onClick={() => showConfirmation(order._id, 'reject')}
                className="px-3 py-1.5 text-sm rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center"
              >
                <BsXCircleFill className="mr-1" />
                Reject
              </button>
            </>
          )}
          {order.status === 'accepted' && order.paymentStatus !== 'paid' && (
            <button
              onClick={() => showConfirmation(order._id, 'complete-payment')}
              className="px-3 py-1.5 text-sm rounded-md text-white bg-purple-600 hover:bg-purple-700 flex items-center"
            >
              <MdPayment className="mr-1" />
              Mark as Paid
            </button>
          )}
          {order.paymentStatus === 'paid' && order.status !== 'delivered' && (
            <button
              onClick={() => showConfirmation(order._id, 'mark-delivered')}
              className="px-3 py-1.5 text-sm rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center"
            >
              <FaTruck className="mr-1" />
              Mark as Delivered
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;