import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from './ProductCard';
import ProductDetails from './ProductDetails';
import AddProductForm from './AddProductForm';
import { useNavigate } from 'react-router-dom';
import Modal from "../Modal";

// Inline Modal Component
const InlineModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="modal-content bg-white p-6 rounded shadow-lg">
        <p>{message}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const ProductManagement = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [pharmacyDetails, setPharmacyDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [headerTitle, setHeaderTitle] = useState('Product Management');

  const [errors, setErrors] = useState({});
  const branchId = localStorage.getItem('branches');
  const pharmacyId = localStorage.getItem('pharmacy');
  const brandColor = localStorage.getItem('brandColor');

  const fetchProducts = async () => {
    if (branchId != "undefined") {
      try {
        const response = await axios.get(`http://localhost:5000/products/getProductByBranchaId/${branchId}`);
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
  };

  const fetchBranchDetails = async () => {
    if (branchId) {
      try {
        const response = await axios.get(`http://localhost:5000/branches/getBranchById/${branchId}`);
        setBranchDetails(response.data);
      } catch (error) {
        console.error('Error fetching branch details:', error);
      }
    }
  };

  const fetchPharmacyDetails = async () => {
    if (pharmacyId) {
      try {
        const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${pharmacyId}`);
        setPharmacyDetails(response.data);
      } catch (error) {
        console.error('Error fetching pharmacy details:', error);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchBranchDetails();
    fetchPharmacyDetails();

    const intervalId = setInterval(fetchProducts, 30000);
    return () => clearInterval(intervalId);
  }, [branchId, pharmacyId]);

  useEffect(() => {
    const filtered = products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const brandMatch = product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const categoryMatch = product.categories?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const priceMatch = product.sellingPrice?.toString().includes(searchTerm) || false;
      return nameMatch || brandMatch || categoryMatch || priceMatch;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setHeaderTitle(`Editing Product: ${product.name}`);
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
    setShowAddProductForm(false);
    setHeaderTitle('Product Management');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleDeleteProduct = (productId) => {
    setConfirmAction('delete');
    setShowConfirmationModal(true);
    setSelectedProduct(productId);
  };

  const confirmActionHandler = async () => {
    if (confirmAction === 'delete' && selectedProduct) {
      try {
        await axios.delete(`http://localhost:5000/products/deleteProduct/${selectedProduct}`);
        setModalMessage('Product deleted successfully.');
        setShowModal(true);
        setProducts(prevProducts => prevProducts.filter(product => product._id !== selectedProduct));
        setSelectedProduct(null);
      } catch (error) {
        setModalMessage('Error deleting product: ' + error.response?.data?.message || 'An unexpected error occurred.');
        setShowModal(true);
      }
    }
    setShowConfirmationModal(false);
  };

  const handleConfirmUpdate = () => {
    setShowConfirmationModal(false);
    confirmActionHandler();
  };

  const handleAddProduct = () => {
    setShowAddProductForm(true);
    setSelectedProduct(null);
    setHeaderTitle('Add New Product');
  };

  return (
    <div className="containermax-h-80 min-h-80 max-h-80 mb-10">
      <h1 className="text-xl font-bold" style={{ color: brandColor }}>{headerTitle}</h1>
      {showAddProductForm ? (
        <AddProductForm
          handleBack={() => {
            setShowAddProductForm(false);
            setHeaderTitle('Product Management');
          }}
          setShowAddProductForm={setShowAddProductForm}
          setHeaderTitle={setHeaderTitle}
          setProducts={setProducts}
          setFilteredProducts={setFilteredProducts}
        />
      ) : selectedProduct ? (
        <ProductDetails
          product={selectedProduct}
          onEditChange={handleEditChange}
          onSave={handleConfirmUpdate}
          onBack={handleBackToList}
          brandColor={brandColor}
          branchDetails={branchDetails}
          pharmacyDetails={pharmacyDetails}
        />
      ) : (
        <>
          <button
            onClick={handleAddProduct}
            className="mb-4 px-2 py-1 text-white rounded mr-5"
            style={{ background: brandColor }}
          >
            Create Product
          </button>

          <input
            type="text"
            placeholder="Search by name, price, category, or brand"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 py-1 px-2 border rounded"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => handleProductClick(product)}
                brandColor={brandColor}
              />
            ))}
          </div>
        </>
      )}

      <InlineModal
        isOpen={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />

      <InlineModal
        isOpen={showConfirmationModal}
        message="Are you sure you want to delete this product?"
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmUpdate}
      />
    </div>
  );
};

export default ProductManagement;