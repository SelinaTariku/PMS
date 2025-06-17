import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import ProductDetails from './ProductDetails';
import AddProductForm from './AddProductForm';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faTimes, faSync } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'brand', label: 'Brand' },
  { value: 'categories', label: 'Category' },
  { value: 'description', label: 'Description' },
  { value: 'sellingPrice', label: 'Price' },
  { value: 'status', label: 'Status' },
  { value: 'all', label: 'All Fields' }
];

// Memoized SearchInput component
const SearchInput = React.memo(({ value, onChange, onClear, brandColor, placeholder }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative flex-grow">
      <input
        ref={inputRef}
        type="text"
        className="w-full py-1 pl-10 pr-8 border rounded-lg focus:outline-none focus:ring-2"
        style={{ borderColor: brandColor }}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <FontAwesomeIcon
        icon={faSearch}
        className="absolute left-3 top-1/2 transform -translate-y-1/2"
        style={{ color: brandColor }}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 transform -translate-y-1/2"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
});

const Modal = ({ isOpen, onClose, title, children, brandColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold" style={{ color: brandColor }}>{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const [state, setState] = useState({
    products: [],
    filteredProducts: [],
    selectedProduct: null,
    branchDetails: null,
    pharmacyDetails: null,
    searchTerm: '',
    searchField: 'all',
    modalMessage: '',
    showModal: false,
    confirmAction: '',
    showConfirmationModal: false,
    showAddProductForm: false,
    headerTitle: 'Product Management',
    errors: {},
    loading: false,
    totalInventoryQuantity: 0, // Added total quantity counter
    noProductsFound: false // Added state to track if no products found
  });

  const formDataRef = useRef({
    lastSearch: { term: '', field: 'all' }
  });

  const navigate = useNavigate();
  const branchId = localStorage.getItem('branches');
  const pharmacyId = localStorage.getItem('pharmacy');
  const brandColor = localStorage.getItem('brandColor');

  const updateState = useCallback((newState) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  const {
    products, filteredProducts, selectedProduct,
    branchDetails, pharmacyDetails, searchTerm,
    searchField, modalMessage, showModal,
    confirmAction, showConfirmationModal,
    showAddProductForm, headerTitle, errors,
    loading, totalInventoryQuantity, noProductsFound
  } = state;

  const calculateTotalQuantity = useCallback((products) => {
    return products.reduce((total, product) => total + (product.quantity || 0), 0);
  }, []);

  const processProductData = useCallback((productsData) => {
    return productsData.map(product => {
      // Calculate quantity from expiration dates if not provided
      const calculatedQuantity = product.quantity ||
        (product.expirationDate?.reduce((sum, ed) => sum + (ed.quantity || 0), 0) || 0);

      return {
        ...product,
        quantity: calculatedQuantity
      };
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    if (branchId && branchId !== "undefined") {
      updateState({ loading: true, noProductsFound: false }); // Reset noProductsFound
      try {
        const response = await axios.get(`http://localhost:5000/products/getProductByBranchId/${branchId}`);

        const productsData = Array.isArray(response.data) ? response.data : [];
        const processedProducts = processProductData(productsData);
        const totalQuantity = calculateTotalQuantity(processedProducts);

        updateState({
          products: processedProducts,
          filteredProducts: processedProducts,
          loading: false,
          totalInventoryQuantity: totalQuantity
        });

        formDataRef.current.lastSearch = {
          term: searchTerm,
          field: searchField
        };

      } catch (error) {
        console.error('Error fetching products:', error);
        updateState({ loading: false });

        if (error.response?.status === 404) {
          // Show modal for 404 error
          updateState({
            noProductsFound: true,
            modalMessage: 'No products found in this branch.',
            showModal: true
          });
        } else {
          // Show generic error message
          updateState({
            modalMessage: error.response?.data?.message || 'Failed to fetch products. Please try again.',
            showModal: true
          });
        }
      }
    } else {
      updateState({ loading: false });
    }
  }, [branchId, searchTerm, searchField, updateState, processProductData, calculateTotalQuantity]);

  const fetchBranchDetails = useCallback(async () => {
    if (branchId) {
      try {
        const response = await axios.get(`http://localhost:5000/branches/getBranchById/${branchId}`);
        updateState({ branchDetails: response.data });
      } catch (error) {
        console.error('Error fetching branch details:', error);
      }
    }
  }, [branchId, updateState]);

  const fetchPharmacyDetails = useCallback(async () => {
    if (pharmacyId) {
      try {
        const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${pharmacyId}`);
        updateState({ pharmacyDetails: response.data });
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
      }
    }
  }, [pharmacyId, updateState]);

  const handleDeleteProduct = useCallback((productId) => {
    updateState({
      confirmAction: 'delete',
      showConfirmationModal: true,
      modalMessage: 'Are you sure you want to delete this product?',
      selectedProduct: productId
    });
  }, [updateState]);

  const confirmActionHandler = useCallback(async () => {
    if (confirmAction === 'delete' && selectedProduct) {
      try {
        await axios.delete(`http://localhost:5000/products/deleteProduct/${selectedProduct}`);
        const updatedProducts = products.filter(product => product._id !== selectedProduct);
        const updatedFilteredProducts = filteredProducts.filter(product => product._id !== selectedProduct);

        updateState({
          modalMessage: 'Product deleted successfully.',
          showModal: true,
          products: updatedProducts,
          filteredProducts: updatedFilteredProducts,
          totalInventoryQuantity: calculateTotalQuantity(updatedProducts),
          selectedProduct: null,
          showConfirmationModal: false
        });
      } catch (error) {
        updateState({
          modalMessage: 'Error deleting product: ' + (error.response?.data?.message || 'An unexpected error occurred.'),
          showModal: true,
          showConfirmationModal: false
        });
      }
    }
  }, [confirmAction, selectedProduct, products, filteredProducts, updateState, calculateTotalQuantity]);

  useEffect(() => {
    fetchProducts();
    fetchBranchDetails();
    fetchPharmacyDetails();
  }, [fetchProducts, fetchBranchDetails, fetchPharmacyDetails]);

  useEffect(() => {
    if (products.length > 0) {
      const term = searchTerm || formDataRef.current.lastSearch.term;
      const field = searchField || formDataRef.current.lastSearch.field;

      const filtered = products.filter(product => {
        if (!term) return true;

        if (field === 'all') {
          return (
            product.name?.toLowerCase().includes(term.toLowerCase()) ||
            product.brand?.toLowerCase().includes(term.toLowerCase()) ||
            product.categories?.toLowerCase().includes(term.toLowerCase()) ||
            product.description?.toLowerCase().includes(term.toLowerCase()) ||
            product.status?.toLowerCase().includes(term.toLowerCase()) ||
            product.sellingPrice?.toString().includes(term)
          );
        }
        return product[field]?.toString().toLowerCase().includes(term.toLowerCase());
      });

      updateState({
        filteredProducts: filtered
      });
    }
  }, [searchTerm, searchField, products, updateState]);

  const handleProductClick = useCallback((product) => {
    updateState({
      selectedProduct: product,
      headerTitle: `Product Details: ${product.name}`,
      showAddProductForm: false
    });
  }, [updateState]);

  const handleBackToList = useCallback(() => {
    updateState({
      selectedProduct: null,
      showAddProductForm: false,
      headerTitle: 'Product Management'
    });
  }, [updateState]);

  const handleAddProduct = useCallback(() => {
    updateState({
      showAddProductForm: true,
      selectedProduct: null,
      headerTitle: 'Add New Product'
    });
  }, [updateState]);

  const handleSearchInputChange = useCallback((e) => {
    updateState({ searchTerm: e.target.value });
  }, [updateState]);

  const handleSearchFieldChange = useCallback((e) => {
    updateState({ searchField: e.target.value });
  }, [updateState]);

  const clearSearch = useCallback(() => {
    updateState({
      searchTerm: '',
      searchField: 'all'
    });
    formDataRef.current.lastSearch = { term: '', field: 'all' };
  }, [updateState]);

  const addProduct = useCallback(async (newProductData) => {
    try {
      const response = await axios.post('http://localhost:5000/products/createProduct', newProductData);
      const newProduct = response.data;
      const processedProduct = processProductData([newProduct])[0];

      updateState(prevState => {
        const updatedProducts = [...prevState.products, processedProduct];
        return {
          products: updatedProducts,
          filteredProducts: [...prevState.filteredProducts, processedProduct],
          totalInventoryQuantity: prevState.totalInventoryQuantity + (processedProduct.quantity || 0),
          showModal: true,
          modalMessage: 'Product created successfully!',
          showAddProductForm: false
        };
      });

      return response;
    } catch (error) {
      updateState({
        modalMessage: 'Error creating product: ' + (error.response?.data?.message || 'An unexpected error occurred.'),
        showModal: true
      });
      throw error;
    }
  }, [updateState, processProductData]);

  if (showAddProductForm) {
    return (
      <AddProductForm
        handleBack={handleBackToList}
        onAddProduct={addProduct}
        brandColor={brandColor}
      />
    );
  }

  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        onBack={handleBackToList}
        onDelete={handleDeleteProduct}
        brandColor={brandColor}
        branchDetails={branchDetails}
        pharmacyDetails={pharmacyDetails}
        onSave={async (updatedProduct) => {
          try {
            const response = await axios.put(
              `http://localhost:5000/products/updateProduct/${updatedProduct._id}`,
              {
                ...updatedProduct,
                updatedBy: localStorage.getItem('id'),
                branch: localStorage.getItem('branches'),
                pharmacy: localStorage.getItem('pharmacy'),
              }
            );

            const processedProduct = processProductData([updatedProduct])[0];

            updateState(prev => {
              const updatedProducts = prev.products.map(p =>
                p._id === updatedProduct._id ? processedProduct : p
              );
              return {
                products: updatedProducts,
                filteredProducts: prev.filteredProducts.map(p =>
                  p._id === updatedProduct._id ? processedProduct : p
                ),
                totalInventoryQuantity: calculateTotalQuantity(updatedProducts),
                modalMessage: 'Product updated successfully!',
                showModal: true
              };
            });

            return response.data;
          } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update product');
          }
        }}
      />
    );
  }

  return (
    <div className="container max-h-80 min-h-80 mb-10 p-4">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md w-full">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold" style={{ color: brandColor }}>{headerTitle}</h1>
                {branchDetails && (
                  <p className="text-gray-600 pl-2 ml-2 border-l border-gray-300">
                    {pharmacyDetails?.name} Pharmacy {branchDetails.name} Branch
                    <span className="ml-2 font-semibold" style={{ color: brandColor }}>
                      (Total: {totalInventoryQuantity} items)
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <motion.button
                  onClick={fetchProducts}
                  className="px-4 py-1 rounded-lg font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: brandColor,
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faSync} />
                </motion.button>
                <motion.button
                  onClick={handleAddProduct}
                  className="px-4 py-1 rounded-lg font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: brandColor,
                    color: 'white'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Add Product</span>
                </motion.button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mt-4">
              <div className="flex flex-col md:flex-row w-full gap-3">
                <div className="relative w-full md:w-48">
                  <select
                    value={searchField}
                    onChange={handleSearchFieldChange}
                    className="w-full py-1 pl-3 pr-8 border rounded-lg appearance-none focus:outline-none focus:ring-2"
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                <SearchInput
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  onClear={clearSearch}
                  brandColor={brandColor}
                  placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label || 'all fields'}...`}
                />
              </div>
            </div>
          </div>

          <div className="p-4">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.1 }}
                    className="h-full"
                  >
                    <div className="border rounded-lg shadow-sm bg-white overflow-hidden cursor-pointer transition-all hover:shadow-md flex flex-row h-full">
                      <div className="w-1/3 h-48 bg-gray-100 flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-2"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="text-gray-400 text-sm flex items-center justify-center h-full">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="w-2/3 p-3 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold truncate flex-grow text-xxs">{product.name}</h3>
                          <span className="text-xs font-medium ml-2" style={{ color: brandColor }}>
                            {product.discount > 0 ? (
                              <>
                                <span className="line-through text-xxs text-gray-400 mr-1">
                                  {product.sellingPrice.toFixed(2)}
                                </span>
                                {(product.sellingPrice - (product.sellingPrice * product.discount / 100)).toFixed(2)} Birr
                              </>
                            ) : (
                              `${product.sellingPrice.toFixed(2)} Birr`
                            )}
                          </span>
                        </div>
                        {product.discount > 0 && (
                          <span className="text-red-600 text-xxs px-1 py-0.5 rounded mb-1 self-start">
                            {product.discount}% OFF
                          </span>
                        )}
                        <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {product.description}
                        </div>
                        <div className="flex justify-between items-center text-xxs mb-2">
                          <div className="truncate">
                            <span className="text-gray-500">Brand: </span>
                            <span className="font-medium">{product.brand}</span>
                          </div>
                          <span className="text-gray-500">Qty: {product.quantity}</span>
                        </div>
                        <div className="mb-2">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xxs px-1 py-0.5 rounded">
                            {product.categories}
                          </span>
                        </div>
                        <button
                          className="mt-auto py-1 rounded text-xs font-medium w-full"
                          style={{
                            backgroundColor: brandColor,
                            color: 'white'
                          }}
                          onClick={() => handleProductClick(product)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
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
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No Product found</h3>
                  <p className="mt-1 text-gray-500">
                    {searchTerm ? 'Try a different search term' : 'No Product have been placed yet'}
                  </p>
                </div>
            )}
          </div>
        </div>
      )}

      <Modal
        isOpen={showConfirmationModal}
        onClose={() => updateState({ showConfirmationModal: false })}
        title="Confirm Action"
        brandColor={brandColor}
      >
        <p className="text-gray-700">{modalMessage}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => updateState({ showConfirmationModal: false })}
            className="px-4 py-2 rounded-lg font-medium border"
          >
            Cancel
          </button>
          <button
            onClick={confirmActionHandler}
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              backgroundColor: brandColor,
              color: 'white'
            }}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;