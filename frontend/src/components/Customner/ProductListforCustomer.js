import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faShoppingCart, faSort } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import SearchInput from './SearchInput';
import Modal from './Modal';
import CartSidebar from './Cart';
import DiscountProductSlider from './DiscountProductSlider';
import ProductCard from './ProductCard';
import { useNavigate } from 'react-router-dom';

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

const SORT_OPTIONS = [
  { value: 'price', label: 'Lowest Price' },
  { value: 'nearest', label: 'Nearest Branch' }
];

const brandColor = "#1E467A";
const isLoggedIn = false

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
  const navigate = useNavigate(); 
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    selectedProduct: null,
    searchTerm: '',
    searchField: 'all',
    modalMessage: '',
    showModal: false,
    confirmAction: '',
    showConfirmationModal: false,
    loading: false,
    totalInventoryQuantity: 0,
    cartItems: [],
    isCartOpen: false,
    sortBy: 'price' 
  });

  const [expandedProduct, setExpandedProduct] = useState(null);
  const [branchDetailsMap, setBranchDetailsMap] = useState(new Map());
  const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
          },
          (error) => {
            console.error("Error getting location: ", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    };

    getCurrentLocation();
  }, []);

  const formDataRef = useRef({
    lastSearch: { term: '', field: 'all' }
  });

  const updateState = useCallback((newState) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const {
    products, filteredProducts, selectedProduct,
    searchTerm, searchField, modalMessage, showModal,
    confirmAction, showConfirmationModal,
    loading, totalInventoryQuantity,
    cartItems, isCartOpen, sortBy
  } = state;

  const fetchProducts = useCallback(async () => {
    updateState({ loading: true });
    try {
      const response = await axios.get(`http://localhost:5000/products/getAllProduct`);
      const productsData = Array.isArray(response.data) ? response.data : [];
      updateState({
        products: productsData,
        filteredProducts: productsData,
        loading: false,
      });

      formDataRef.current.lastSearch = {
        term: searchTerm,
        field: searchField
      };

    } catch (error) {
      console.error('Error fetching products:', error);
      updateState({
        loading: false,
        modalMessage: error.response?.data?.message || 'Failed to fetch products. Please try again.',
        showModal: true
      });
    }
  }, [searchTerm, searchField, updateState]);

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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchAllDetails = async () => {
      const updatedMap = new Map();

      for (const product of products) { // Use products here, not filteredProducts
        const branchDetails = await fetchBranchDetails(product.branch);
        const pharmacyDetails = await fetchPharmacyDetails(product.pharmacy);

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

    if (products.length > 0 && currentLocation.lat && currentLocation.lng) { 
      fetchAllDetails();
    }
  }, [products, currentLocation, fetchBranchDetails, fetchPharmacyDetails]);

  useEffect(() => {
    let filtered = products.filter(product => {
      const key = searchField === 'all' ? null : searchField;
      const value = searchTerm.toLowerCase();

      if (!key) {
        return Object.values(product).some(val => String(val).toLowerCase().includes(value));
      }

      if (key === 'pharmacyDetails.name') {
        const branchInfo = branchDetailsMap.get(product._id) || {};
        return branchInfo.pharmacyDetails?.name?.toLowerCase().includes(value);
      }

      if (key === 'branchDetails.name') {
        const branchInfo = branchDetailsMap.get(product._id) || {};
        return branchInfo.branchDetails?.name?.toLowerCase().includes(value);
      }

      return String(product[key]).toLowerCase().includes(value);
    });

    let sortedProducts = [...filtered];

    if (sortBy === 'price') {
      sortedProducts.sort((a, b) => a.sellingPrice - b.sellingPrice);
    } else if (sortBy === 'nearest' && currentLocation.lat && currentLocation.lng) {
      sortedProducts.sort((a, b) => {
        const distanceA = branchDetailsMap.get(a._id)?.distance || Infinity;
        const distanceB = branchDetailsMap.get(b._id)?.distance || Infinity;
        return distanceA - distanceB;
      });
    }

    updateState({ filteredProducts: sortedProducts });
  }, [searchTerm, searchField, products, updateState, branchDetailsMap, sortBy, currentLocation]);

  const toggleExpandProduct = useCallback((productId) => {
    setExpandedProduct(prev => (prev === productId ? null : productId));
  }, []);

  const clearSearch = useCallback(() => {
    updateState({
      searchTerm: '',
      searchField: 'all'
    });
    formDataRef.current.lastSearch = { term: '', field: 'all' };
  }, [updateState]);

  const toggleCart = useCallback(() => {
    updateState(prev => ({ isCartOpen: !prev.isCartOpen }));
  }, [updateState]);

  const removeFromCart = useCallback((productId) => {
    updateState(prev => ({
      cartItems: prev.cartItems.filter(item => item._id !== productId)
    }));
  }, [updateState]);

  const updateCartItemQuantity = useCallback((productId, change) => {
    updateState(prev => {
      const updatedItems = prev.cartItems.map(item => {
        if (item._id === productId) {
          const newQuantity = item.quantity + change;
          return {
            ...item,
            quantity: newQuantity > 0 ? newQuantity : 1
          };
        }
        return item;
      });

      return { cartItems: updatedItems };
    });
  }, [updateState]);

  const handleCheckout = useCallback(() => {
    updateState({
      modalMessage: `Checkout successful for ${cartItems.length} items!`,
      showModal: true,
      isCartOpen: false,
      cartItems: []
    });
  }, [cartItems.length, updateState]);

  const handleSearchFieldChange = useCallback((e) => {
    updateState({ searchField: e.target.value });
  }, [updateState]);

  const handleSearchInputChange = useCallback((e) => {
    updateState({ searchTerm: e.target.value });
  }, [updateState]);

  const handleSortByChange = useCallback((e) => {
    updateState({ sortBy: e.target.value });
  }, [updateState]);

  const addToCart = useCallback((product) => {
    if (!isLoggedIn) {
      alert("You must be logged in to add items to the cart!");
      navigate("/PMS/login"); 
      return; 
    }

    console.log("addToCart called with product:", product); 
    updateState(prev => {
      const existingItem = prev.cartItems.find(item => item._id === product._id);

      if (existingItem) {
        const updatedCartItems = prev.cartItems.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
        return {
          ...prev,
          cartItems: updatedCartItems,
          modalMessage: `${product.name} quantity increased in cart`,
          showModal: true
        };
      } else {
        return {
          ...prev,
          cartItems: [...prev.cartItems, { ...product, quantity: 1 }],
          modalMessage: `${product.name} added to cart`,
          showModal: true
        };
      }
    });
  }, [updateState, isLoggedIn, navigate]); 

  const confirmActionHandler = useCallback(() => {
    if (confirmAction === 'deleteProduct' && selectedProduct) {
      updateState({
        showConfirmationModal: false,
        modalMessage: 'Product deleted successfully',
        showModal: true,
        products: products.filter(p => p._id !== selectedProduct._id),
        filteredProducts: filteredProducts.filter(p => p._id !== selectedProduct._id),
        selectedProduct: null
      });
    }
  }, [confirmAction, selectedProduct, products, filteredProducts, updateState]);

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="mb-10 p-4 md:p-6 overflow-hidden overflow-y-auto w-full">
      {/* <motion.button
        onClick={toggleCart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-6 z-40 p-4 rounded-full shadow-xl relative"
        style={{
          background: `linear-gradient(135deg, ${brandColor}, ${brandColor}80)`,
          color: 'white'
        }}
      >
        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
        {totalCartItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center"
          >
            {totalCartItems}
          </motion.span>
        )}
      </motion.button>

      <CartSidebar
        isOpen={isCartOpen}
        onClose={toggleCart}
        cartItems={cartItems}
        onRemoveItem={removeFromCart}
        onQuantityChange={updateCartItemQuantity}
        onCheckout={handleCheckout}
      /> */}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm w-full overflow-hidden">
          <DiscountProductSlider
            products={products}
            onAddToCart={addToCart} // Pass addToCart to DiscountProductSlider
          />

          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col md:flex-row w-full gap-3">
                <div className="relative w-full md:w-56">
                  <select
                    value={searchField}
                    onChange={handleSearchFieldChange}
                    className="w-full py-3 pl-4 pr-10 border-2 rounded-xl appearance-none focus:outline-none focus:ring-2 cursor-pointer"
                    style={{
                      borderColor: brandColor,
                      color: brandColor,
                      backgroundColor: 'white'
                    }}
                  >
                    {SEARCH_FIELDS.map((field) => (
                      <option key={field.value} value={field.value}>
                        {field.label}
                      </option>
                    ))}
                  </select>
                </div>

                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onClear={clearSearch}
                  placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label || 'all fields'}...`}
                />
              </div>

              <div className="relative w-full md:w-56">
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FontAwesomeIcon icon={faSort} className="text-gray-400" />
                </div>
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="w-full py-3 pl-4 pr-10 border-2 rounded-xl appearance-none focus:outline-none focus:ring-2 cursor-pointer"
                  style={{
                    borderColor: brandColor,
                    color: brandColor,
                    backgroundColor: 'white'
                  }}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => {
                  const branchInfo = branchDetailsMap.get(product._id) || {};
                  return (
                    <ProductCard
                      key={product._id}
                      product={product}
                      branchInfo={branchInfo}
                      onProductClick={toggleExpandProduct}
                      onAddToCart={() => {
                        console.log("Add to cart clicked for product:", product);
                        addToCart(product);
                      }}
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
                  {searchTerm ? 'No products found' : 'No products available'}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {searchTerm ? 'Try different search terms' : 'Add new products to get started'}
                </p>
                {searchTerm && (
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
      )}

      <Modal
        isOpen={showModal}
        onClose={() => updateState({ showModal: false })}
        title={modalMessage.includes('Error') ? 'Error' : 'Success'}
      >
        <p className="text-gray-700 mb-6">{modalMessage}</p>
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

      <Modal
        isOpen={showConfirmationModal}
        onClose={() => updateState({ showConfirmationModal: false })}
        title="Confirm Action"
      >
        <p className="text-gray-700 mb-6">{modalMessage}</p>
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
  );
};

export default ProductListforCustomer;