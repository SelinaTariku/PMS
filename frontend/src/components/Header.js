import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faBell,
  faChevronDown,
  faChevronUp,
  faTimes,
  faEye,
  faEyeSlash,
  faCheckDouble,
  faUser,
  faSignOutAlt,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Toast Notification Component
const ToastNotification = ({ message, onClose, brandColor }) => {
  const handleClose = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    onClose();
  };

  return (
    <div 
      className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-xs z-50 border-l-4 flex items-start justify-between transition-all duration-300 transform hover:scale-[1.02]"
      style={{ 
        borderLeftColor: brandColor, 
        animation: 'fadeInUp 0.3s ease-out forwards',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}
    >
      <p className="text-sm text-gray-800 mr-2">{message}</p>
      <button 
        onClick={handleClose} 
        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
      >
        <FontAwesomeIcon icon={faTimes} size="xs" />
      </button>
    </div>
  );
};

const Header = () => {
  const brandColor = localStorage.getItem('brandColor') || '#4A90E2';
  const pharmacyLogo = localStorage.getItem('PharmacyLogo');
  const userName = localStorage.getItem('userName') || 'Guest';
  const PharmacyName = localStorage.getItem('PharmacyName') || 'Your Pharmacy';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notificationList, setNotificationList] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('unread');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const style = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .notification-badge {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  `;

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => {
      if (!prev) {
        fetchAllNotifications();
      }
      return !prev;
    });
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const closeAllPanels = (event) => {
    if (!event.target.closest('#notification-panel') && 
        !event.target.closest('#notification-toggle') &&
        !event.target.closest('#menu-panel') &&
        !event.target.closest('#menu-toggle')) {
      setIsMenuOpen(false);
      setIsNotificationsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeAllPanels);
    return () => document.removeEventListener('click', closeAllPanels);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate('/PharmacSphere');
  };

  const fetchUnreadNotifications = async () => {
    const roleId = localStorage.getItem('role');
    const branchId = localStorage.getItem('branches');
    const pharmacyId = localStorage.getItem('pharmacy');

    if (!roleId || !branchId) {
      console.error("Missing roleId or branchId in localStorage");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/notif/getNotificationsByRole/${roleId}/${branchId}/${pharmacyId}`);
      const notifications = response.data || [];
      
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      const newNotifications = unreadNotifications.filter(newNotif => 
        !notificationList.some(existingNotif => existingNotif._id === newNotif._id)
      );
      
      newNotifications.forEach(notif => {
        showToast(notif.message || notif.title || 'New notification', notif._id);
      });
      
      setNotificationList(unreadNotifications);
      setNotificationCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching unread notifications:", error);
    }
  };

  const fetchReadNotifications = async () => {
    const roleId = localStorage.getItem('role');
    const branchId = localStorage.getItem('branches');
    const pharmacyId = localStorage.getItem('pharmacy');

    if (!roleId || !branchId) {
      console.error("Missing roleId or branchId in localStorage");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/notif/getReadNotificationsByRole/${roleId}/${branchId}/${pharmacyId}`);
      setReadNotifications(response.data || []);
    } catch (error) {
      console.error("Error fetching read notifications:", error);
    }
  };

  const fetchAllNotifications = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchUnreadNotifications(), fetchReadNotifications()]);
    } catch (error) {
      console.error("Error fetching all notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, notificationId) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, notificationId }]);
    
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

const removeToast = (id) => {
  setToasts(prev => prev.filter(toast => toast.id !== id));
};

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`http://localhost:5000/notif/readNotification/${notificationId}`);
      
      setNotificationList(prev => 
        prev.filter(n => n._id !== notificationId)
      );
      
      const markedNotification = notificationList.find(n => n._id === notificationId);
      if (markedNotification) {
        setReadNotifications(prev => [{
          ...markedNotification,
          isRead: true
        }, ...prev]);
      }
      
      setNotificationCount(prev => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(notificationList.map(notif => 
        axios.put(`http://localhost:5000/notif/readNotification/${notif._id}`)
      ));
      
      setReadNotifications(prev => [
        ...notificationList.map(n => ({ ...n, isRead: true })),
        ...prev
      ]);
      setNotificationList([]);
      setNotificationCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleNotificationClick = (notificationId) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [notificationId]: !prev[notificationId]
    }));

    const notification = notificationList.find(n => n._id === notificationId);
    if (notification && !notification.isRead && expandedNotifications[notificationId]) {
      markAsRead(notificationId);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications(); 
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderNotificationItem = (notif, isRead = false) => (
    <li 
      key={notif._id} 
      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
        !isRead ? 'bg-blue-50' : ''
      }`}
      onClick={() => handleNotificationClick(notif._id)}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: !isRead ? brandColor : '#d1d5db' }}
          />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <p className={`text-sm ${isRead ? 'text-gray-600' : 'font-medium text-gray-900'}`}>
                {notif.message || notif.title || 'New notification'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
            <FontAwesomeIcon 
              icon={expandedNotifications[notif._id] ? faChevronUp : faChevronDown} 
              className="text-gray-400 ml-2" 
              size="xs"
            />
          </div>
          
          {expandedNotifications[notif._id] && (
            <div className="mt-2 text-xs text-gray-600">
              {notif.details || 'No additional details available'}
            </div>
          )}
        </div>
      </div>
    </li>
  );

  return (
    <>
      <style>{style}</style>
      
      <header className="flex justify-between items-center w-full px-4" style={{ 
        backgroundColor: brandColor, 
        height: '70px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div className="flex items-center w-full">
          {pharmacyLogo && (
            <img
              src={pharmacyLogo}
              alt="Pharmacy Logo"
              className="h-full object-cover"
              style={{ 
                maxHeight: 'full', 
                width: '255px', 
                marginRight: '10px',
                filter: 'brightness(0) invert(1)'
              }}
            />
          )}
          <span className="text-white font-bold text-2xl" style={{ 
            whiteSpace: 'nowrap',
            textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
          }}>
            {`${PharmacyName} Pharmacy`}
          </span>
        </div>

        <div className="relative flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-sm font-semibold"
              style={{ color: brandColor }}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="ml-2 text-white hidden md:inline">{userName}</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button 
              id="notification-toggle" 
              onClick={toggleNotifications}
              className="relative p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FontAwesomeIcon icon={faBell} className="text-white text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center notification-badge">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Notifications Panel */}
            {isNotificationsOpen && (
              <div id="notification-panel" className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-xl rounded-lg overflow-hidden z-20"
                style={{
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  transformOrigin: 'top right',
                  animation: 'fadeInUp 0.2s ease-out'
                }}
              >
                <div className="flex justify-between items-center p-3 border-b">
                  <h3 className="text-lg font-semibold" style={{color: brandColor}}>
                    Notifications
                  </h3>
                  <div className="flex space-x-3">
                    {notificationCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs hover:underline flex items-center"
                        style={{color: brandColor}}
                        title="Mark all as read"
                      >
                        <FontAwesomeIcon icon={faCheckDouble} className="mr-1" size="xs" />
                        Mark all
                      </button>
                    )}
                    <button 
                      onClick={() => setActiveTab(prev => prev === 'unread' ? 'all' : 'unread')}
                      className="text-xs hover:underline flex items-center"
                      style={{color: brandColor}}
                      title={activeTab === 'unread' ? "Show all notifications" : "Show only unread"}
                    >
                      <FontAwesomeIcon 
                        icon={activeTab === 'unread' ? faEye : faEyeSlash} 
                        className="mr-1" 
                        size="xs"
                      />
                      {activeTab === 'unread' ? 'All' : 'Unread'}
                    </button>
                  </div>
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center" style={{color: brandColor}}>
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-2"
                        style={{ borderBottomColor: brandColor }}></div>
                      Loading notifications...
                    </div>
                  ) : activeTab === 'unread' ? (
                    notificationList.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No unread notifications
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notificationList.map(notif => renderNotificationItem(notif))}
                      </ul>
                    )
                  ) : (
                    [...notificationList, ...readNotifications].length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No notifications available
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {notificationList.map(notif => renderNotificationItem(notif))}
                        {readNotifications.map(notif => renderNotificationItem(notif, true))}
                      </ul>
                    )
                  )}
                </div>
                
                <div className="p-2 border-t text-center bg-gray-50">
                  <button 
                    className="text-sm hover:underline flex items-center justify-center w-full py-2"
                    style={{color: brandColor}}
                    onClick={fetchAllNotifications}
                  >
                    <FontAwesomeIcon icon={faBell} className="mr-2" size="xs" />
                    Refresh Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button 
              id="menu-toggle" 
              onClick={toggleMenu}
              className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FontAwesomeIcon icon={faBars} className="text-white text-xl" />
            </button>

            {/* Menu Panel */}
            {isMenuOpen && (
              <div id="menu-panel" className="absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-lg overflow-hidden z-20"
                style={{
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  transformOrigin: 'top right',
                  animation: 'fadeInUp 0.2s ease-out'
                }}
              >
                <div className="py-1">
                  <a 
                    href="#" 
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    style={{ color: brandColor }}
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-3" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    style={{ color: brandColor }}
                  >
                    <FontAwesomeIcon icon={faCog} className="mr-3" />
                    Settings
                  </a>
                  <a
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                    style={{ color: brandColor }}
                    onClick={handleLogout}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" />
                    Logout
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <ToastNotification 
            key={toast.id}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
            brandColor={brandColor}
          />
        ))}
      </div>
    </>
  );
};

export default Header;