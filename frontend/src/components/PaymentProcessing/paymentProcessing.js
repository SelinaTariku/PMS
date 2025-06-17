import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FiSearch,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiInfo,
  FiClock,
  FiCreditCard,
  FiPrinter
} from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const PaymentProcessing = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ field: 'orderAt', direction: 'desc' });
  const [modalState, setModalState] = useState({
    showConfirmation: false,
    showReceipt: false,
    selectedOrderId: null
  });
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutUrls, setCheckoutUrls] = useState({});
  const [qrCodeUrls, setQrCodeUrls] = useState({});
  const TAX_RATE = 0.15;
  const brandColor = localStorage.getItem('brandColor') || '#4f46e5';

  const branchId = localStorage.getItem('branches');
  const user = localStorage.getItem('id');
  const pharmacyData = {
    userEmail: localStorage.getItem('id'),
    name: localStorage.getItem('PharmacyName'),
    branch: localStorage.getItem('branchesName'),
    tin: localStorage.getItem('tin'),
    address: localStorage.getItem('address'),
    phone: localStorage.getItem('phone')
  };
  const userEmail = localStorage.getItem('email') || 'customer@example.com';

  const statusConfig = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    accepted: { bg: 'bg-green-100', text: 'text-green-800' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800' },
    paid: { bg: 'bg-green-100', text: 'text-green-800' },
    unpaid: { bg: 'bg-red-100', text: 'text-red-800' }
  };

  const searchOptions = [
    { value: 'all', label: 'All Fields' },
    { value: 'orderId', label: 'Order ID' },
    { value: 'status', label: 'Order Status' },
    { value: 'orderedFor', label: 'Customer Phone' },
    { value: 'paymentStatus', label: 'Payment Status' }
  ];

  const sortOptions = [
    { value: 'orderAt', label: 'Order Date' },
    { value: 'totalAmount', label: 'Total Amount' },
    { value: 'orderedFor', label: "Customer Phone No" },
    { value: 'status', label: 'Status' },
    { value: 'paymentStatus', label: 'Payment Status' }
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      if (!branchId) return;

      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/order/getAcceptedOrder/${branchId}`);
        setOrders(response.data);
        setFilteredOrders(response.data);

        // Initialize checkout URLs for pending payments
        const pendingOrders = response.data.filter(order => order.paymentStatus === 'pending');
        const urls = {};
        for (const order of pendingOrders) {
          try {
            const paymentData = {
              amount: order.totalAmount,
              currency: "ETB",
              email: "customer@gmail.com",
              first_name: "John",
              last_name: "Doe",
              phone_number: "0949348192",
              tx_ref: order._id,
              callback_url: "http://localhost:3000/payment/callback",
            };

            const response = await axios.post('http://localhost:5000/pay/initializePayment', paymentData);
            if (response.data.status === "success") {
              urls[order._id] = response.data.data.checkout_url;
            }
            return response.data.data.checkout_url;
          } catch (error) {
            console.error(`Failed to get checkout URL for order ${order._id}:`, error);
          }
        }
        setCheckoutUrls(urls);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [branchId]);

  useEffect(() => {
    let result = [...orders];

    if (searchTerm) {
      result = result.filter(order => {
        const searchValue = searchTerm.toLowerCase();
        if (searchField === 'all') {
          return (
            order._id.toLowerCase().includes(searchValue) ||
            order.status.toLowerCase().includes(searchValue) ||
            order.paymentStatus.toLowerCase().includes(searchValue) ||
            order.paymentType?.toLowerCase().includes(searchValue) ||
            order.paymentMethod?.toLowerCase().includes(searchValue)
          );
        }
        return String(order[searchField]).toLowerCase().includes(searchValue);
      });
    }

    result.sort((a, b) => {
      const field = sortConfig.field;
      const modifier = sortConfig.direction === 'asc' ? 1 : -1;

      if (field === 'orderAt') {
        return (new Date(a[field]) - new Date(b[field])) * modifier;
      }
      if (field === 'totalAmount') {
        return (a[field] - b[field]) * modifier;
      }
      return String(a[field]).localeCompare(String(b[field])) * modifier;
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, searchField, sortConfig]);

  const handleSearch = (e) => setSearchTerm(e.target.value.toLowerCase());
  const toggleExpandOrder = (orderId) =>
    setExpandedOrderId(prev => prev === orderId ? null : orderId);

  const showPaymentConfirmation = (orderId) =>
    setModalState({ showConfirmation: true, selectedOrderId: orderId });

  const closeModal = () =>
    setModalState({ showConfirmation: false, showReceipt: false, selectedOrderId: null });

  const processPayment = async () => {
    try {
      const { selectedOrderId } = modalState;
      await axios.put(`http://localhost:5000/order/payForOrder/${selectedOrderId}/${user}`);

      const order = orders.find(o => o._id === selectedOrderId);

      const subtotal = order.products.reduce((total, item) => {
        const itemTotal = item.price * item.quantity * (1 - (item.discount || 0) / 100);
        return total + itemTotal;
      }, 0);

      const taxAmount = subtotal * TAX_RATE;
      const totalAmount = subtotal + taxAmount;

      setCurrentReceipt({
        ...order,
        pharmacyData,
        userEmail,
        date: new Date().toLocaleString(),
        taxAmount: taxAmount.toFixed(2),
        subtotal: subtotal.toFixed(2),
        totalAmount: totalAmount.toFixed(2)
      });

      const updateOrderStatus = (orders) => orders.map(o =>
        o._id === selectedOrderId ? { ...o, paymentStatus: 'paid' } : o
      );

      setOrders(updateOrderStatus);
      setFilteredOrders(updateOrderStatus);

      setModalState({
        showConfirmation: false,
        showReceipt: true,
        selectedOrderId: null
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
      closeModal();
    }
  };

  const ChapaprocessPayment = async (selectedOrderId) => {
    const order = orders.find(o => o._id === selectedOrderId);
    if (order.checkoutUrl) {
      window.open(order.checkoutUrl, '_blank');
      return;
    }
    const paymentData = {
      amount: order.totalAmount,
      currency: "ETB",
      email: "customer@gmail.com",
      first_name: "John",
      last_name: "Doe",
      phone_number: "0949348192",
      tx_ref: order._id,
      callback_url: "http://localhost:3000/payment/callback",
    };

    try {
      console.log("Sending payment data:", paymentData);

      const response = await axios.post('http://localhost:5000/pay/initializePayment', paymentData);

      console.log("Chapa API response:", response.data);

      if (response.data.status === "success") {
        const checkoutUrl = response.data.data.checkout_url;
        window.location.href = checkoutUrl;
      } else {
        console.error("Payment initialization failed:", response.data.message);
        alert("Payment initialization failed. Please try again.");
      }

    } catch (error) {
      console.error("Chapa error response:", error.response?.data);
      alert("Payment failed. Please try again.");
    }
  };

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${currentReceipt._id}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 15px; }
            .divider { border-top: 1px dashed #ccc; margin: 10px 0; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 5px 0; border-bottom: 1px solid #eee; }
            td { padding: 5px 0; }
            .text-right { text-align: right; }
            .summary { background: #f8f8f8; padding: 10px; border-radius: 8px; margin: 15px 0; }
            .footer { text-align: center; font-size: 12px; margin-top: 20px; }
            .qr-code { display: flex; justify-content: center; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div id="receipt-content">
            ${document.getElementById('receipt-content').innerHTML}
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
          <div className="p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded mt-4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const Receipt = ({ receipt, onClose }) => {
    const { pharmacyData, products, paymentMethod, totalAmount, subtotal, taxAmount, paymentStatus, _id, checkoutUrl } = receipt;

    const printReceipt = () => {
      const printContent = document.getElementById('receipt-content').innerHTML;
      const printWindow = window.open('', '', 'width=400,height=600');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${receipt._id}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                width: 80mm; 
                margin: 0 auto; 
                padding: 10px; 
                color: #333;
              }
              .header { 
                text-align: center; 
                margin-bottom: 5px; 
                border-bottom: 2px dashed #ccc;
                padding-bottom: 5px;
              }
              .pharmacy-name {
                font-weight: bold;
                font-size: 1.2em;
                margin-bottom: 3px;
              }
              .divider {
                border-top: 1px dashed #ccc;
                margin: 5px 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 5px 0;
              }
              th {
                text-align: left;
                padding: 2px 0;
                font-weight: bold;
              }
              td {
                padding: 2px 0;
              }
              .text-right {
                text-align: right;
              }
              .summary {
                margin: 8px 0;
                padding: 5px;
                background: #f8f8f8;
                border-radius: 5px;
              }
              .footer {
                text-align: center;
                margin-top: 10px;
                font-size: 0.8em;
                border-top: 2px dashed #ccc;
                padding-top: 5px;
              }
              .qr-container {
                display: flex;
                justify-content: center;
                margin: 10px 0;
              }
              .thank-you {
                font-weight: bold;
                text-align: center;
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div id="print-content">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => { window.close(); }, 1000);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    };

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-2">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs max-h-[90vh] overflow-y-auto">
          <div id="receipt-content" className="p-4 space-y-2">
            <div className="text-center mb-3 border-b-2 border-dashed border-gray-300 pb-2">
              <div className="pharmacy-name text-lg font-bold" style={{ color: brandColor }}>
                TIN: {pharmacyData.tin}
              </div>
              <div className="pharmacy-name text-xs text-gray-600 mt-1 font-bold">
                {pharmacyData.name + " Pharmacy " + pharmacyData.branch + " Branch"}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {pharmacyData.address}
              </div>
              <div className="text-xs text-gray-600">
                TEL: {pharmacyData.phone}
              </div>
            </div>

            <div className="text-center mb-2">
              <div className="text-sm font-semibold">CASH SALES INVOICE</div>
              <div className="text-xs text-gray-600">
                {new Date().toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="overflow-x-auto mb-3">
              <tbody>
                {products.map((item, i) => {
                  const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
                  const itemTotal = discountedPrice * item.quantity;
                  const taxForItem = itemTotal * TAX_RATE;
                  const totalForItem = itemTotal + taxForItem;

                  return (
                    <React.Fragment key={i}>
                      <tr className="border-b border-gray-100">
                        <td colSpan={4} className="py-1">
                          <div className="font-medium">{item.name}</div>
                        </td>
                      </tr>
                      <tr className="text-xs text-gray-700">
                        <td className="text-right py-1 px-1">{item.quantity}</td>
                        <td className="text-right py-1 px-1">×</td>
                        <td className="text-right py-1 px-1">
                          {discountedPrice.toFixed(2)} ETB
                          {item.discount > 0 && (
                            <span className="text-[10px] text-red-500 ml-1">
                              (-{item.discount}%)
                            </span>
                          )}
                        </td>
                        <td className="text-right py-1 px-1 font-medium">
                          {itemTotal.toFixed(2)} ETB
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
              <div className="flex justify-between text-sm mb-1">
                <span>Subtotal:</span>
                <span className="font-medium">{subtotal} ETB</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tax (15%):</span>
                <span className="font-medium">{taxAmount} ETB</span>
              </div>
              <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-gray-300">
                <span>TOTAL:</span>
                <span>{totalAmount} ETB</span>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Payment: <span className="capitalize">{paymentMethod}</span>
              </div>
            </div>

            {(paymentStatus === 'Pending' || (paymentStatus === 'paid' && paymentMethod !== 'Cash') || (paymentMethod ==='Cash' && checkoutUrl !=="") ) && (
              <div className="flex flex-col items-center my-4">
                <div className="text-xs mb-1 text-gray-600">Scan to complete payment</div>
                <div className="bg-white p-3 rounded-lg border-2 border-dashed" style={{ borderColor: brandColor }}>
                  <QRCodeSVG
                    value={checkoutUrl || ""}
                    size={120}
                    level="H"
                    includeMargin={true}
                    bgColor="#FFFFFF"
                    fgColor={brandColor}
                  />
                </div>
              </div>
            )}



            <div className="text-center mt-4 pt-3 border-t-2 border-dashed border-gray-300">
              <div className="text-sm font-semibold mb-1" style={{ color: brandColor }}>
                Thank you for your purchase!
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 flex justify-between">
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={printReceipt}
              className="flex items-center px-3 py-1 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: brandColor }}
            >
              <FiPrinter className="mr-2" /> Print
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OrderCard = ({ order }) => {
    const isExpanded = expandedOrderId === order._id;
    const orderDate = new Date(order.orderAt).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const handlePrintReceipt = () => {
      const receiptData = {
        ...order,
        pharmacyData,
        userEmail,
        date: new Date().toLocaleString(),
        taxAmount: (order.totalAmount * TAX_RATE).toFixed(2),
        subtotal: (order.totalAmount / 1.15).toFixed(2),
        totalAmount: order.totalAmount.toFixed(2),
        paymentStatus: order.paymentStatus
      };
      setCurrentReceipt(receiptData);
      setModalState({
        showReceipt: true,
        selectedOrderId: order._id
      });
    };

    return (
      <div className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${isExpanded ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Customer Phone {order.orderedFor}</h3>
              <p className="text-sm text-gray-500 flex items-center">
                <FiClock className="mr-1" /> {orderDate}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.status]?.bg} ${statusConfig[order.status]?.text}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-600 font-bold" style={{ color: brandColor }}>Total:</span>
              <span className="font-bold" style={{ color: brandColor }}>{order.totalAmount} ETB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment:</span>
              <span className="flex items-center">
                <FiCreditCard className="mr-1" /> {order.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[order.paymentStatus]?.bg} ${statusConfig[order.paymentStatus]?.text}`}>
                {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Order Details:</h4>
              <ul className="space-y-3">
                {order.products?.map((product, i) => {
                  const itemTotal = product.price * product.quantity;
                  const withdescount = product.price - (product.price * (product.discount / 100))
                  const taxForItem = itemTotal * TAX_RATE;
                  const totalForItem = itemTotal + taxForItem;
                  return (
                    <li key={i} className="flex justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.quantity} * {withdescount} ETB
                          {product.discount > 0 && ` (${product.discount}% off)`}
                        </p>
                      </div>
                      <span className="font-medium">
                        {itemTotal.toFixed(2)} ETB
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="mt-6 flex justify-between space-x-3">
            <button
              onClick={() => toggleExpandOrder(order._id)}
              className="flex items-center justify-center px-3 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {isExpanded ? (
                <>
                  <FiChevronUp className="mr-1" /> Less
                </>
              ) : (
                <>
                  <FiChevronDown className="mr-1" /> More
                </>
              )}
            </button>

            {order.paymentStatus !== 'paid' && (
              <button
                onClick={() => {
                  ChapaprocessPayment(order._id);
                }}
                className="flex items-center justify-center px-3 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                {order.checkoutUrl ? 'Complete' : 'Chapa'}
              </button>
            )}
            {order.paymentStatus !== 'paid' && (
              <button
                onClick={() => showPaymentConfirmation(order._id)}
                className="flex items-center justify-center px-3 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                Cash
              </button>
            )}
            {(order.paymentStatus === 'paid' || order.checkoutUrl) && (
              <button
                onClick={handlePrintReceipt}
                className="flex items-center justify-center px-3 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                <FiPrinter className="mr-1" />
              </button>
            )}

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-h-80 min-h-80 mb-10 p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: brandColor }}>Payment Processing</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="flex gap-2 w-full">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {searchOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder={`Search ${searchField === 'all' ? 'orders' : searchOptions.find(f => f.value === searchField)?.label.toLowerCase()}...`}
                className="block w-full pl-10 pr-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={sortConfig.field}
              onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortConfig(prev => ({
                ...prev,
                direction: prev.direction === 'asc' ? 'desc' : 'asc'
              }))}
              className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
            >
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiInfo className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No orders found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {searchTerm ? 'No matching orders found' : 'There are currently no orders'}
          </p>
        </div>
      )}

      {modalState.showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-xl shadow-xl max-w-md w-full">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-bold text-gray-800" style={{ color: brandColor }}>Confirm Payment</h2>
            </div>
            <p className="mb-2 text-gray-600 text-center">
              Are you sure you want to process this payment? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={closeModal}
                className="px-2 py-1 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processPayment}
                className="px-2 py-1 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: brandColor }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.showReceipt && currentReceipt && (
        <Receipt receipt={currentReceipt} onClose={closeModal} />
      )}
    </div>
  );
};

export default PaymentProcessing;