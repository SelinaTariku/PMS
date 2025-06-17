import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faSort, faHeart, faKey, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import SearchInput from './SearchInput';
import Modal from './Modal';
import Cart from './Cart';
import DiscountProductSlider from './DiscountProductSlider';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
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
  faCog,
  faSyncAlt,
  faBox,
  faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';

const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'brand', label: 'Brand' },
  { value: 'categories', label: 'Category' },
  { value: 'description', label: 'Description' },
  { value: 'sellingPrice', label: 'Price' },
  { value: 'status', label: 'Status' },
  { value: 'pharmacyDetails.name', label: 'Pharmacy' },
  { value: 'branchDetails.name', label: 'Branch' },
  { value: 'all', label: 'All Fields' }
];

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

const SORT_OPTIONS = [
  { value: 'price', label: 'Lowest Price' },
  { value: 'nearest', label: 'Nearest Branch' }
];

const brandColor = "#1E467A";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const ProductListforCustomer = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationList, setNotificationList] = useState([]);
  const [readNotifications, setReadNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [toasts, setToasts] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [activeTab, setActiveTab] = useState('unread');
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    searchTerm: '',
    searchField: 'all',
    modalMessage: '',
    showModal: false,
    loading: false,
    cartItems: [],
    isCartOpen: false,
    sortBy: 'price',
    favorites: [],
    showUserDropdown: false,
    showOrderModal: false,
    selectedProduct: null,
    orderQuantity: 1,
    showOrderSuccessModal: false,
    orderSuccessMessage: '',
    showConfirmationModal: false,
    confirmAction: ''
  });

  const updateState = useCallback((newState) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);


const handleTrackOrder = async (order) => {
  try {

    if (!order?.pharmacyId || !order?.branchId) {
      throw new Error('Order is missing pharmacy or branch information');
    }

    const [pharmacy, branch] = await Promise.all([
      fetch(`http://localhost:5000/pharmacies/getPharmacyById/${order.pharmacyId}`)
        .then(res => res.ok ? res.json() : Promise.reject('Pharmacy not found')),
      fetch(`http://localhost:5000/branches/getBranchById/${order.branchId}`)
        .then(res => res.ok ? res.json() : Promise.reject('Branch not found'))
    ]);

    if (!branch?.location) {
      throw new Error('Branch location information is not available');
    }

    const modal = Object.assign(document.createElement('div'), {
      className: 'map-modal',
      innerHTML: `
        <div class="map-container">
          <button class="close-button" aria-label="Close map">×</button>
          <div class="loading-message">Loading map...</div>
        </div>
      `
    });

    document.body.appendChild(modal);

    const style = document.createElement('style');
    style.textContent = `
      .map-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.7);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
      }
      .map-container {
        width: 90%;
        height: 80%;
        background: white;
        border-radius: 16px;
        position: relative;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        overflow: hidden;
      }
      .close-button {
        position: absolute;
        top: 12px;
        right: 12px;
        background: #ff4757;
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        font-size: 20px;
        cursor: pointer;
        z-index: 1001;
        transition: transform 0.2s;
      }
      .close-button:hover {
        transform: scale(1.1);
      }
      .loading-message {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: ${pharmacy.brandColor || '#4a6bdf'};
        font-size: 1.2rem;
      }
      #map {
        width: 100%;
        height: 100%;
      }
    `;
    document.head.appendChild(style);

    // State management
    let map, userMarker, branchMarker, routeLine, watchId;
    const branchLocation = branch.location;

    // Close handler
    modal.querySelector('.close-button').addEventListener('click', () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      document.body.removeChild(modal);
      document.head.removeChild(style);
      document.querySelectorAll('link[href*="leaflet"], script[src*="leaflet"]')
        .forEach(el => el.remove());
    });

    // Dynamic Leaflet loading with modern approach
    const loadLeaflet = () => new Promise((resolve) => {
      if (window.L) return resolve();

      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCSS.crossOrigin = '';

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJS.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletJS.crossOrigin = '';
      leafletJS.onload = resolve;

      document.head.append(leafletCSS, leafletJS);
    });

    await loadLeaflet();

    if (typeof L === 'undefined') {
      throw new Error('Failed to load map library');
    }

    // Create map container
    const mapContainer = modal.querySelector('.map-container');
    const mapDiv = Object.assign(document.createElement('div'), { id: 'map' });
    mapContainer.appendChild(mapDiv);

    // Remove loading message
    mapContainer.querySelector('.loading-message').remove();

    // Custom icons with modern SVG approach
    const createCustomIcon = (iconName, color) => {
      const iconSvg = {
        person: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
        pharmacy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}"><path d="M12 2L4 7v12h16V7L12 2zm0 3.3l6 3.3v1.6l-6 3.3-6-3.3V8.6l6-3.3zM6 17v-2.5l6 3.3 6-3.3V17H6z"/></svg>`
      };
      
      return L.divIcon({
        html: iconSvg[iconName],
        className: 'custom-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
    };

    // Initialize map with modern settings
    map = L.map('map', {
      preferCanvas: true,
      zoomControl: false,
      fadeAnimation: true,
      zoomAnimation: true
    }).setView([0, 0], 2);

    // Modern tile layer with retina support
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      detectRetina: true,
      maxZoom: 19,
      minZoom: 2
    }).addTo(map);

    // Add zoom control with modern position
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Add branch marker with custom icon
    branchMarker = L.marker([branchLocation.lat, branchLocation.lng], {
      icon: createCustomIcon('pharmacy', pharmacy.brandColor || '#4a6bdf'),
      riseOnHover: true
    }).addTo(map).bindPopup(`
      <div class="branch-popup">
        <h3>${pharmacy.name} Pharmacy</h3>
        <p>${branch.name} Branch ${branch.status}</p>
         <p>${branch.status}</p>
        <small>${branch.location.address || ''}</small>
      </div>
    `);

    // Info panel with modern design
    const infoPanel = Object.assign(document.createElement('div'), {
      className: 'info-panel',
      innerHTML: `
        <h3>${pharmacy.name} Pharmacy</h3>
        <p className={ ${branch.status === 'Closed' ? 'branch-closed' : 'branch-open'}}>${branch.name} Branch   ${branch.status}</p>
        
        <div class="distance-info">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="${pharmacy.brandColor || '#4a6bdf'}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span id="distance-value">Calculating distance...</span>
        </div>
      `
    });
    mapContainer.appendChild(infoPanel);

    // Add styles for info panel
    const infoStyle = document.createElement('style');
    infoStyle.textContent = `
      .info-panel {
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: white;
        padding: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 1000;
        max-width: 300px;
        backdrop-filter: blur(10px);
        background-color: rgba(255,255,255,0.9);
      }
      .info-panel h3 {
        margin: 0 0 4px 0;
        color: ${pharmacy.brandColor || '#4a6bdf'};
        font-size: 1.1rem;
      }
      .info-panel p {
        margin: 0 0 8px 0;
        font-size: 0.9rem;
        color: #555;
      }
      .distance-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.9rem;
      }
      .branch-popup h3 {
        margin: 0 0 4px 0;
        color: ${pharmacy.brandColor || '#4a6bdf'};
      }
      .branch-popup small {
        color: #666;
      }
      .custom-icon {
        background: white;
        border-radius: 50%;
        padding: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(infoStyle);

    // Modern route updating with error boundaries
    const updateRoute = async (currentLocation) => {
      try {
        // Use Mapbox Directions API for more accurate routing (replace with your access token)
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${currentLocation.lng},${currentLocation.lat};${branchLocation.lng},${branchLocation.lat}?geometries=geojson&access_token=YOUR_MAPBOX_TOKEN`
        );
        
        if (!response.ok) throw new Error('Routing failed');
        
        const data = await response.json();
        
        if (data.routes?.[0]) {
          const route = data.routes[0];
          const routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          
          if (routeLine) {
            routeLine.setLatLngs(routeCoordinates);
          } else {
            routeLine = L.polyline(routeCoordinates, {
              color: pharmacy.brandColor || '#4a6bdf',
              weight: 4,
              opacity: 0.8,
              lineJoin: 'round',
              dashArray: '8, 8'
            }).addTo(map);
          }
          
          // Update distance with modern formatting
          const distanceKm = (route.distance / 1000).toFixed(1);
          const distanceText = distanceKm < 1 
            ? `${(route.distance).toFixed(0)} meters` 
            : `${distanceKm} km`;
          
          document.getElementById('distance-value').textContent = distanceText;
          
          // Smooth bounds adjustment
          map.flyToBounds([
            [currentLocation.lat, currentLocation.lng],
            [branchLocation.lat, branchLocation.lng]
          ], { padding: [100, 100] });
        }
      } catch (error) {
        console.warn('Routing error:', error);
        // Fallback to straight line with animation
        const straightLine = [
          [currentLocation.lat, currentLocation.lng],
          [branchLocation.lat, branchLocation.lng]
        ];
        
        if (routeLine) {
          routeLine.setLatLngs(straightLine);
        } else {
          routeLine = L.polyline(straightLine, {
            color: pharmacy.brandColor || '#4a6bdf',
            weight: 3,
            dashArray: '5, 5',
            opacity: 0.6
          }).addTo(map);
        }
        
        // Calculate straight-line distance
        const straightDistance = map.distance(
          L.latLng(currentLocation.lat, currentLocation.lng),
          L.latLng(branchLocation.lat, branchLocation.lng)
        );
        
        document.getElementById('distance-value').textContent = 
          `About ${(straightDistance / 1000).toFixed(1)} km (straight line)`;
      }
    };

    // Modern geolocation with permissions handling
    if (navigator.geolocation) {
      const handlePositionSuccess = (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Add or update user marker with smooth transition
        if (userMarker) {
          userMarker.setLatLng([userLocation.lat, userLocation.lng]);
        } else {
          userMarker = L.marker([userLocation.lat, userLocation.lng], {
            icon: createCustomIcon('person', '#ff4757'),
            zIndexOffset: 1000
          }).addTo(map).bindPopup("Your Location");
          
          // Initial view adjustment
          map.flyTo([userLocation.lat, userLocation.lng], 13);
        }

        updateRoute(userLocation);
      };

      const handlePositionError = (error) => {
        console.warn('Geolocation error:', error);
        // Center on branch with nice animation
        map.flyTo([branchLocation.lat, branchLocation.lng], 15);
        document.getElementById('distance-value').textContent = 
          'Enable location access for live tracking';
      };

      // Check permissions first (modern API)
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' })
          .then(permissionStatus => {
            if (permissionStatus.state === 'granted') {
              watchId = navigator.geolocation.watchPosition(
                handlePositionSuccess,
                handlePositionError,
                { enableHighAccuracy: true, maximumAge: 10000 }
              );
            } else {
              // More user-friendly approach
              infoPanel.innerHTML += `
                <button class="enable-location" style="
                  margin-top: 8px;
                  background: ${pharmacy.brandColor || '#4a6bdf'};
                  color: white;
                  border: none;
                  padding: 8px 12px;
                  border-radius: 8px;
                  cursor: pointer;
                ">
                  Enable Live Tracking
                </button>
              `;
              
              modal.querySelector('.enable-location')?.addEventListener('click', () => {
                watchId = navigator.geolocation.watchPosition(
                  handlePositionSuccess,
                  handlePositionError,
                  { enableHighAccuracy: true, maximumAge: 10000 }
                );
              });
              
              handlePositionError();
            }
          });
      } else {
        // Fallback for browsers without permissions API
        watchId = navigator.geolocation.watchPosition(
          handlePositionSuccess,
          handlePositionError,
          { enableHighAccuracy: true, maximumAge: 10000 }
        );
      }
    } else {
      // Geolocation not supported
      map.flyTo([branchLocation.lat, branchLocation.lng], 15);
      document.getElementById('distance-value').textContent = 
        'Geolocation not supported by your browser';
    }

  } catch (error) {
    console.error('Error:', error);
    // Modern error notification
    const notification = Object.assign(document.createElement('div'), {
      className: 'error-notification',
      innerHTML: `
        <p>${error.message}</p>
        <button>OK</button>
      `,
      onclick: (e) => {
        if (e.target.tagName === 'BUTTON') {
          document.body.removeChild(notification);
        }
      }
    });
    
    document.body.appendChild(notification);
    
    // Add some basic styles
    const notificationStyle = document.createElement('style');
    notificationStyle.textContent = `
      .error-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #ff4757;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 1100;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .error-notification button {
        background: white;
        color: #ff4757;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
      }
    `;
    document.head.appendChild(notificationStyle);
  }
};

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [branchDetailsMap, setBranchDetailsMap] = useState(new Map());
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });

  // Fetch customer orders
  const fetchCustomerOrders = useCallback(async () => {
    const customerId = localStorage.getItem('id');
    if (!customerId) return;

    setOrdersLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/order/getOrderByCustomerId/${customerId}`);
      setCustomerOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      updateState({
        modalMessage: 'Failed to fetch orders. Please try again.',
        showModal: true
      });
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  const toggleOrders = useCallback(() => {
    setIsOrdersOpen(prev => {
      if (!prev) {
        fetchCustomerOrders();
      }
      return !prev;
    });
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    if (state.isCartOpen) updateState({ isCartOpen: false });
  }, [fetchCustomerOrders, state.isCartOpen, updateState]);

  // Notification functions
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

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
    setIsNotificationsOpen(false);
    setIsOrdersOpen(false);
  };

  const closeAllPanels = (event) => {
    if (!event.target.closest('#notification-panel') &&
      !event.target.closest('#notification-toggle') &&
      !event.target.closest('#menu-panel') &&
      !event.target.closest('#menu-toggle') &&
      !event.target.closest('#orders-panel') &&
      !event.target.closest('#orders-toggle')) {
      setIsMenuOpen(false);
      setIsNotificationsOpen(false);
      setIsOrdersOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', closeAllPanels);
    return () => document.removeEventListener('click', closeAllPanels);
  }, []);

  useEffect(() => {
    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderNotificationItem = (notif, isRead = false) => (
    <li
      key={notif._id}
      className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${!isRead ? 'bg-blue-50' : ''
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

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => {
      if (!prev) {
        fetchAllNotifications();
      }
      return !prev;
    });
    setIsMenuOpen(false);
    setIsOrdersOpen(false);
  };



  const handleCancelOrder = async (orderId) => {
    const userId = localStorage.getItem('id');
    if (!userId) {
      updateState({
        modalMessage: 'User not identified. Please login again.',
        showModal: true
      });
      return;
    }

    try {
      const response = await axios.put(`http://localhost:5000/order/cancelRecord/${orderId}/${userId}`);

      if (response.data.success) {
        // Refresh orders after successful cancellation
        fetchCustomerOrders();
        updateState({
          modalMessage: 'Order cancelled successfully!',
          showModal: true
        });
      } else {
        updateState({
          modalMessage: response.data.message || 'Failed to cancel order',
          showModal: true
        });
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      updateState({
        modalMessage: error.response?.data?.message || 'Failed to cancel order. Please try again.',
        showModal: true
      });
    }
  };


  const ChapaprocessPayment = async (order) => {
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
        window.open(checkoutUrl, '_blank');
      } else {
        console.error("Payment initialization failed:", response.data.message);
        alert("Payment initialization failed. Please try again.");
      }

    } catch (error) {
      console.error("Chapa error response:", error.response?.data);
      alert("Payment failed. Please try again.");
    }
  };

  const fetchProducts = useCallback(async () => {
    updateState({ loading: true });
    try {
      const response = await axios.get('http://localhost:5000/products/getAllProduct');
      const productsData = Array.isArray(response.data) ? response.data : [];
      updateState({
        products: productsData,
        filteredProducts: productsData,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      updateState({
        loading: false,
        modalMessage: error.response?.data?.message || 'Failed to fetch products. Please try again.',
        showModal: true
      });
    }
  }, [updateState]);

  const fetchBranchDetails = useCallback(async (branchId) => {
    try {
      const response = await axios.get(`http://localhost:5000/branches/getBranchById/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch details:', error);
      return null;
    }
  }, []);

  const fetchPharmacyDetails = useCallback(async (pharmacyId) => {
    try {
      const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${pharmacyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pharmacy details:', error);
      return null;
    }
  }, []);

  const fetchCartItems = useCallback(async () => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    try {
      const response = await axios.get(`http://localhost:5000/cart/getCart/${userId}`);
      if (response.data && response.data.items) {
        updateState({ cartItems: response.data.items });
      } else {
        updateState({ cartItems: [] });
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      updateState({ cartItems: [] });
    }
  }, [updateState]);

  const addToCart = useCallback(async (product) => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    try {
      await axios.post('http://localhost:5000/cart/addToCart/', {
        productId: product._id,
        customerId: userId,
        quantity: state.orderQuantity
      });
      fetchCartItems();
      updateState(prev => ({
        ...prev,
        modalMessage: `${product.name} (${state.orderQuantity}) added to cart`,
        showModal: true,
        showOrderModal: false
      }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      updateState(prev => ({
        ...prev,
        modalMessage: 'Failed to add to cart. Please try again.',
        showModal: true
      }));
    }
  }, [fetchCartItems, state.orderQuantity, updateState]);

  const showOrderConfirmation = (product) => {
    updateState({
      selectedProduct: product,
      showOrderModal: true,
      orderQuantity: 1
    });
  };

  const placeOrder = useCallback(async () => {
    const userId = localStorage.getItem('id');
    const { selectedProduct, orderQuantity } = state;

    if (!userId || !selectedProduct) return;

    const orderData = {
      products: [{
        productId: selectedProduct._id,
        name: selectedProduct.name,
        quantity: orderQuantity,
        price: selectedProduct.sellingPrice,
      }],
      totalAmount: selectedProduct.sellingPrice * orderQuantity,
      status: "Pending",
      branchId: selectedProduct.branch,
      pharmacyId: selectedProduct.pharmacy,
      orderedBy: userId,
      orderedFor: userId,
      paymentType: 'In Advance',
      paymentMethod: 'Cash',
      userLocation: {
        lat: currentLocation.lat || 0,
        lng: currentLocation.lng || 0,
      },
    };

    try {
      await axios.post('http://localhost:5000/order/createOrder', orderData);
      fetchCustomerOrders(); // Refresh orders after placing new one

      updateState({
        showOrderModal: false,
        showOrderSuccessModal: true,
        orderSuccessMessage: `Order placed successfully for ${selectedProduct.name} (Quantity: ${orderQuantity})`
      });
    } catch (error) {
      console.error('Error placing order:', error);
      updateState({
        showOrderModal: false,
        modalMessage: 'Failed to place order. Please try again.',
        showModal: true
      });
    }
  }, [state.selectedProduct, state.orderQuantity, currentLocation, updateState, fetchCustomerOrders]);

  const updateCartItemQuantity = useCallback(async (productId, change) => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    try {
      await axios.put(`http://localhost:5000/cart/updateQuantity/${userId}`, { productId, change });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  }, [fetchCartItems]);

  const removeFromCart = useCallback(async (productId) => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    try {
      await axios.put(`http://localhost:5000/cart/removeItem/${userId}`, { productId });
      fetchCartItems();
      updateState(prev => ({
        ...prev,
        modalMessage: 'Item removed from cart',
        showModal: true
      }));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }, [fetchCartItems, updateState]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('userName');
    navigate('/PMS/login');
  }, [navigate]);

  const handleChangePassword = useCallback(() => {
    navigate('/PMS/Change-Password');
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
    fetchCartItems();
    fetchCustomerOrders();
  }, [fetchProducts, fetchCartItems, fetchCustomerOrders]);

  useEffect(() => {
    const fetchAllDetails = async () => {
      const updatedMap = new Map();

      for (const product of state.products) {
        const branchDetails = await axios.get(`http://localhost:5000/branches/getBranchById/${product.branch}`);
        const pharmacyDetails = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${product.pharmacy}`);
        if (branchDetails && pharmacyDetails) {
          const distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            branchDetails.location.lat,
            branchDetails.location.lng
          );

          updatedMap.set(product._id, {
            branchDetails,
            pharmacyDetails,
            distance
          });
        }
      }

      setBranchDetailsMap(updatedMap);
    };

    if (state.products.length > 0 && currentLocation.lat && currentLocation.lng) {
      fetchAllDetails();
    }
  }, [state.products, currentLocation, fetchBranchDetails, fetchPharmacyDetails]);

  useEffect(() => {
    let filtered = state.products.filter(product => {
      const key = state.searchField === 'all' ? null : state.searchField;
      const value = state.searchTerm.toLowerCase();

      if (!key) {
        return Object.values(product).some(val => String(val).toLowerCase().includes(value));
      }

      return String(product[key]).toLowerCase().includes(value);
    });

    let sortedProducts = [...filtered];

    if (state.sortBy === 'price') {
      sortedProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (state.sortBy === 'nearest') {
      sortedProducts.sort((a, b) => {
        const aDistance = branchDetailsMap.get(a._id)?.distance || Infinity;
        const bDistance = branchDetailsMap.get(b._id)?.distance || Infinity;
        return aDistance - bDistance;
      });
    }

    updateState({ filteredProducts: sortedProducts });
  }, [state.searchTerm, state.searchField, state.products, state.sortBy, branchDetailsMap, updateState]);

  const toggleExpandProduct = useCallback((productId) => {
    setExpandedProduct(prev => (prev === productId ? null : productId));
  }, []);

  const clearSearch = useCallback(() => {
    updateState({
      searchTerm: '',
      searchField: 'all'
    });
  }, [updateState]);

  const toggleCart = useCallback(() => {
    updateState(prev => ({
      ...prev,
      isCartOpen: !prev.isCartOpen
    }));
    setIsOrdersOpen(false);
  }, [updateState]);

  const handleCheckout = useCallback(async () => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    try {
      updateState({
        modalMessage: `Checkout successful for ${state.cartItems.length} items!`,
        showModal: true,
        isCartOpen: false,
        cartItems: []
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      updateState({
        modalMessage: 'Failed to complete checkout. Please try again.',
        showModal: true
      });
    }
  }, [state.cartItems.length, updateState]);

  const handleSearchFieldChange = useCallback((e) => {
    updateState({ searchField: e.target.value });
  }, [updateState]);

  const handleSearchInputChange = useCallback((e) => {
    updateState({ searchTerm: e.target.value });
  }, [updateState]);

  const handleSortByChange = useCallback((e) => {
    updateState({ sortBy: e.target.value });
  }, [updateState]);

  const toggleUserDropdown = useCallback(() => {
    updateState(prev => ({ showUserDropdown: !prev.showUserDropdown }));
  }, [updateState]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      updateState({ orderQuantity: value });
    }
  };

  const incrementQuantity = () => {
    updateState(prev => ({ orderQuantity: prev.orderQuantity + 1 }));
  };

  const decrementQuantity = () => {
    if (state.orderQuantity > 1) {
      updateState(prev => ({ orderQuantity: prev.orderQuantity - 1 }));
    }
  };

  const totalCartItems = state.cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  const toggleFavorite = (productId) => {
    updateState(prev => {
      const isFavorite = prev.favorites.includes(productId);
      const favorites = isFavorite
        ? prev.favorites.filter(id => id !== productId)
        : [...prev.favorites, productId];

      return { favorites };
    });
  };

  const confirmActionHandler = useCallback(() => {
    if (state.confirmAction === 'deleteProduct' && state.selectedProduct) {
      updateState({
        showConfirmationModal: false,
        modalMessage: 'Product deleted successfully',
        showModal: true,
        products: state.products.filter(p => p._id !== state.selectedProduct._id),
        filteredProducts: state.filteredProducts.filter(p => p._id !== state.selectedProduct._id),
        selectedProduct: null
      });
    }
  }, [state.confirmAction, state.selectedProduct, state.products, state.filteredProducts, updateState]);

  const userName = localStorage.getItem('userName');

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mb-4 px-2 py-1 md:p-2 overflow-hidden overflow-y-auto w-full">
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-30 px-4 py-2 ">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <h1 className="text-xl font-bold" style={{ color: brandColor }}>Pharmacy Management</h1>
          </div>

          <div className="relative flex items-center gap-4">
            <div
              className="relative flex items-center cursor-pointer"
              onMouseEnter={toggleUserDropdown}
              onMouseLeave={toggleUserDropdown}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold"
                style={{ color: brandColor }}>
                {userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="ml-2 hidden md:inline" style={{ color: brandColor }}>
                {userName || 'User'}
              </span>
            </div>

            {/* Cart Button */}
            <div className="relative">
              <button
                id="cart-toggle"
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faShoppingCart} className="text-xl" style={{ color: brandColor }} />
                {totalCartItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center notification-badge">
                    {totalCartItems}
                  </span>
                )}
              </button>

              {/* Cart Panel */}
              {state.isCartOpen && (
                <div id="cart-panel" className="absolute right-0 mt-2 w-80 sm:w-96 bg-white shadow-xl rounded-lg overflow-hidden z-20"
                  style={{
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    transformOrigin: 'top right',
                    animation: 'fadeInUp 0.2s ease-out'
                  }}
                >
                  <div className="flex justify-between items-center p-3 border-b">
                    <h3 className="text-lg font-semibold" style={{ color: brandColor }}>
                      Your Cart ({totalCartItems})
                    </h3>
                    <button
                      onClick={fetchCartItems}
                      className="text-xs hover:underline flex items-center"
                      style={{ color: brandColor }}
                      title="Refresh cart"
                    >
                      <FontAwesomeIcon icon={faCheckDouble} className="mr-1" size="xs" />
                      Refresh
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {state.cartItems.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        Your cart is empty
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {state.cartItems.map(item => (
                          <li key={item.productId} className="p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  ${item.price.toFixed(2)} each
                                </p>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={() => updateCartItemQuantity(item.productId, -1)}
                                  className="px-2 py-1 border rounded-l-lg bg-gray-100 hover:bg-gray-200"
                                >
                                  -
                                </button>
                                <span className="px-3 py-1 border-t border-b">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartItemQuantity(item.productId, 1)}
                                  className="px-2 py-1 border rounded-r-lg bg-gray-100 hover:bg-gray-200"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-sm text-gray-600">
                                Total: ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              <button
                                onClick={() => removeFromCart(item.productId)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {state.cartItems.length > 0 && (
                    <div className="p-3 border-t">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-semibold">
                          ${state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={handleCheckout}
                        className="w-full py-2 rounded-lg font-medium transition-all"
                        style={{
                          backgroundColor: brandColor,
                          color: 'white'
                        }}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifications Button */}
            <div className="relative">
              <button
                id="notification-toggle"
                onClick={toggleNotifications}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faBell} className="text-xl" style={{ color: brandColor }} />
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
                    <h3 className="text-lg font-semibold" style={{ color: brandColor }}>
                      Notifications
                    </h3>
                    <div className="flex space-x-3">
                      {notificationCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs hover:underline flex items-center"
                          style={{ color: brandColor }}
                          title="Mark all as read"
                        >
                          <FontAwesomeIcon icon={faCheckDouble} className="mr-1" size="xs" />
                          Mark all
                        </button>
                      )}
                      <button
                        onClick={() => setActiveTab(prev => prev === 'unread' ? 'all' : 'unread')}
                        className="text-xs hover:underline flex items-center"
                        style={{ color: brandColor }}
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
                      <div className="p-4 text-center" style={{ color: brandColor }}>
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
                      style={{ color: brandColor }}
                      onClick={fetchAllNotifications}
                    >
                      <FontAwesomeIcon icon={faBell} className="mr-2" size="xs" />
                      Refresh Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Button */}
            {/* Orders Button */}
            <div className="relative">
              <button
                id="orders-toggle"
                onClick={toggleOrders}
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors group"
                aria-label="My orders"
              >
                <FontAwesomeIcon
                  icon={faBoxOpen}
                  className="text-xl transition-transform group-hover:scale-110"
                  style={{ color: brandColor }}
                />
                {customerOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 text-xs flex items-center justify-center notification-badge animate-pulse">
                    {customerOrders.length}
                  </span>
                )}
              </button>

              {/* Modern Orders Panel */}
              {isOrdersOpen && (
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
                          <motion.div
                            key={order._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          >
                            {/* Order Header */}
                            <div className="p-4 border-b">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-bold" style={{ color: brandColor }}>
                                    {order.pharmacy?.name? `${order.pharmacy.name} Pharmacy` : "Pharmacy Name"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {order.branch?.name ? `${order.branch.name} Branch` : "Branch Name"}
                                  </p>
                                  <p className="text-xs text-gray-700 font-medium mt-1 mb-1">
                                    {formatDate(order.createdAt)}
                                  </p>
                                  <h4 className="text-xs font-medium text-gray-700 mt-1 mb-1">
                                    {order.products.length} Items
                                  </h4>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${order.status === 'Accepted' || order.status === 'accepted' ? 'text-green-800 bg-green-100' :
                                      order.status === 'Pending' ? 'text-red-800 bg-red-100' :
                                        order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    Order Status: {order.status}
                                  </span>
                                  {order.status === 'Accepted' && <span className={`px-2 py-1 text-xs rounded-full font-medium mt-1 ${order.paymentStatus === 'Pending' ? 'text-red-800 bg-red-100' :
                                      order.paymentStatus === 'paid' ? 'text-green-800 bg-green-100' :
                                        order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                                          'bg-gray-100 text-gray-800'
                                    }`}>
                                    Payment Status: {order.paymentStatus}
                                  </span>}
                                  <span className="mt-2 text-sm font-semibold" style={{ color: brandColor }}>
                                    Amount: {order.totalAmount.toFixed(2)} Birr
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Order Summary */}
                            <div className="p-1">
                              {/* Expandable Details */}
                              {expandedNotifications[order._id] && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-3 pt-3 border-t border-gray-100 px-4"
                                >
                                  <div className="space-y-3">
                                    <h4 className="text-sm font-medium" style={{ color: brandColor }}>Order Items</h4>
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
                                      <span className="text-gray-500 font-bold" style={{ color: brandColor }}>Subtotal</span>
                                      <span>{order.totalAmount.toFixed(2)} Birr</span>
                                    </div>
                                    <div className="flex justify-between text-sm mb-2">
                                      <span className="text-gray-500 font-bold" style={{ color: brandColor }}>Payment method</span>
                                      <span className="capitalize">{order.paymentMethod}</span>
                                    </div>
                                    {order.branch?.location && (
                                      <div className="mt-3">
                                        <h4 className="text-sm font-medium mb-2" style={{ color: brandColor }}>Branch Location</h4>
                                        <p className="text-xs text-gray-600">{order.branch.location.address}</p>
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
                                style={{ color: brandColor }}
                              >
                                {expandedNotifications[order._id] ? (
                                  <>
                                    <FontAwesomeIcon icon={faChevronUp} className="mr-1" size="xs" style={{ color: brandColor }} />
                                    Less details
                                  </>
                                ) : (
                                  <>
                                    <FontAwesomeIcon icon={faChevronDown} className="mr-1" size="xs" style={{ color: brandColor }} />
                                    More details
                                  </>
                                )}
                              </button>

                              <div className="flex space-x-2">
                                {(
                                  <button
                                    onClick={() => handleTrackOrder(order)}
                                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
                                    style={{ color: brandColor }}
                                  >
                                    <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                                    Track Pharmacy
                                  </button>
                                )}
                                {(order.status === 'Pending' || (order.status === 'Accepted' && order.paymentStatus == 'Pending')) && order.paymentStatus !== 'Paid' && (
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
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                id="menu-toggle"
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faBars} className="text-xl" style={{ color: brandColor }} />
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
                  <div className="py-1 ">
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
        </div>
      </div>

      {/* Main Content (with padding to account for fixed header) */}
      <div className="mt-20">
        {state.loading && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderBottomColor: brandColor }}></div>
              <p className="text-lg" style={{ color: brandColor }}>Loading products...</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm w-full overflow-hidden">
          <DiscountProductSlider
            products={state.products}
            onAddToCart={addToCart}
          />

          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col md:flex-row w-full gap-3">
                <div className="relative w-full md:w-56">
                  <select
                    value={state.searchField}
                    onChange={handleSearchFieldChange}
                    className="w-full py-3 pl-4 pr-10 border-2 rounded-xl appearance-none focus:outline-none focus:ring-2 cursor-pointer"
                    style={{
                      borderColor: brandColor,
                      color: brandColor,
                      backgroundColor: 'white'
                    }}
                  >
                    {SEARCH_FIELDS.map(field => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <SearchInput
                  value={state.searchTerm}
                  onChange={handleSearchInputChange}
                  onClear={clearSearch}
                  placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === state.searchField)?.label || 'all fields'}...`}
                />
              </div>

              <div className="relative w-full md:w-56">
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FontAwesomeIcon icon={faSort} className="text-gray-400" />
                </div>
                <select
                  value={state.sortBy}
                  onChange={handleSortByChange}
                  className="w-full py-3 pl-4 pr-10 border-2 rounded-xl appearance-none focus:outline-none focus:ring-2 cursor-pointer"
                  style={{
                    borderColor: brandColor,
                    color: brandColor,
                    backgroundColor: 'white'
                  }}
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6" style={{ background: `linear-gradient(135deg, ${brandColor}20, #ffffff)` }}>
            {state.filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {state.filteredProducts.map(product => {
                  const branchInfo = branchDetailsMap.get(product._id);
                  console.log("Detail in the map: ", branchInfo)
                  const isFavorite = state.favorites.includes(product._id);
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      branchInfo={branchInfo}
                      onProductClick={toggleExpandProduct}
                      onAddToCart={() => showOrderConfirmation(product)}
                      onOrder={() => showOrderConfirmation(product)}
                      onToggleFavorite={() => toggleFavorite(product._id)}
                      isFavorite={isFavorite}
                      brandColor={brandColor}
                      expandedProduct={expandedProduct}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-2xl" />
                </div>
                <p className="text-gray-600 text-lg mb-2">
                  {state.searchTerm ? 'No products found' : 'No products available'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {state.searchTerm ? 'Try different search terms' : 'Add new products to get started'}
                </p>
                {state.searchTerm && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearSearch}
                    className="px-6 py-2 rounded-xl font-medium shadow-sm transition-all"
                    style={{
                      backgroundColor: brandColor,
                      color: 'white'
                    }}
                  >
                    Clear Search
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cart Modal */}
        {state.isCartOpen && (
          <Cart
            isOpen={state.isCartOpen}
            onClose={toggleCart}
            cartItems={state.cartItems}
            onRemoveItem={removeFromCart}
            onQuantityChange={updateCartItemQuantity}
            onCheckout={handleCheckout}
            brandColor={brandColor}
          />
        )}

        {/* Order Confirmation Modal */}
        <Modal
          isOpen={state.showOrderModal}
          onClose={() => updateState({ showOrderModal: false })}
          title="Confirm Order"
        >
          {state.selectedProduct && (
            <div>
              <div className="mb-4">
                <p className="text-gray-700 mb-2">You're ordering: <strong>{state.selectedProduct.name}</strong></p>
                {state.selectedProduct.discount > 0 && (
                  <p className="text-gray-700 mb-4">Price: ${state.selectedProduct.sellingPrice - ((state.selectedProduct.sellingPrice * state.selectedProduct.discount / 100))}</p>
                )}
                {state.selectedProduct.discount === 0 && (
                  <p className="text-gray-700 mb-4">Price: ${state.selectedProduct.sellingPrice}</p>
                )}

                <div className="flex items-center mb-4">
                  <label className="mr-4 text-gray-700">Quantity:</label>
                  <div className="flex items-center">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-1 border rounded-l-lg bg-gray-100 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={state.orderQuantity}
                      onChange={handleQuantityChange}
                      className="w-16 px-2 py-1 border-t border-b text-center"
                    />
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-1 border rounded-r-lg bg-gray-100 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 font-bold">
                  Total: ${(state.selectedProduct.sellingPrice * state.orderQuantity).toFixed(2)}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateState({ showOrderModal: false })}
                  className="px-6 py-2 rounded-xl font-medium border border-gray-300 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={placeOrder}
                  className="px-6 py-2 rounded-xl font-medium transition-all"
                  style={{
                    backgroundColor: brandColor,
                    color: 'white'
                  }}
                >
                  Place Order
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(state.selectedProduct)}
                  className="px-6 py-2 rounded-xl font-medium transition-all"
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white'
                  }}
                >
                  Add to Cart
                </motion.button>
              </div>
            </div>
          )}
        </Modal>

        {/* Order Success Modal */}
        <Modal
          isOpen={state.showOrderSuccessModal}
          onClose={() => updateState({ showOrderSuccessModal: false })}
          title="Order Successful"
        >
          <p className="text-gray-700 mb-6">{state.orderSuccessMessage}</p>
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => updateState({ showOrderSuccessModal: false })}
              className="px-6 py-2 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: brandColor,
                color: 'white'
              }}
            >
              OK
            </motion.button>
          </div>
        </Modal>

        {/* General Message Modal */}
        <Modal
          isOpen={state.showModal}
          onClose={() => updateState({ showModal: false })}
          title={state.modalMessage.includes('Error') ? 'Error' : 'Success'}
        >
          <p className="text-gray-700 mb-6">{state.modalMessage}</p>
          <div className="flex justify-end">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => updateState({ showModal: false })}
              className="px-6 py-2 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: brandColor,
                color: 'white'
              }}
            >
              OK
            </motion.button>
          </div>
        </Modal>

        {/* Confirmation Modal */}
        <Modal
          isOpen={state.showConfirmationModal}
          onClose={() => updateState({ showConfirmationModal: false })}
          title="Confirm Action"
        >
          <p className="text-gray-700 mb-6">{state.modalMessage}</p>
          <div className="flex justify-end gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => updateState({ showConfirmationModal: false })}
              className="px-6 py-2 rounded-xl font-medium border border-gray-300 transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={confirmActionHandler}
              className="px-6 py-2 rounded-xl font-medium transition-all"
              style={{
                backgroundColor: brandColor,
                color: 'white'
              }}
            >
              Confirm
            </motion.button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default ProductListforCustomer;