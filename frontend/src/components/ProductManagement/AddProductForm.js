import React, { useState } from 'react';
import axios from 'axios';
import Modal from '../Modal'; // Importing the Modal component

const categories = [
  "Pain Reliever", "Antibiotic", "Vitamin", "Antihistamine", "Cough Suppressant",
  "Decongestant", "Anti-inflammatory", "Allergy Relief", "Digestive Aid",
  "Skin Treatment", "Beauty and Personal Care", "First Aid", "Heart Health",
  "Blood Pressure", "Diabetes Care", "Weight Management", "Sleep Aid",
  "Mood Support", "Nutritional Supplement", "Herbal Remedy", "Homeopathic",
  "Immunity Booster", "Respiratory Health", "Other"
];

const AddProductForm = ({ handleBack, setShowAddProductForm, setHeaderTitle, setProducts, setFilteredProducts }) => {
  const brandColor = localStorage.getItem('brandColor');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    categories: '',
    quantity: 0,
    discount: 0,
    purchasePrice: 0,
    sellingPrice: 0,
    status: 'Available',
    CURR: 0,
    brand: '',
    image: '',
    dosage: '',
    dosageUnit: '',
    expirationDate: '',
  });
  const [errors, setErrors] = useState({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleConfirmCreate = () => {
    const requiredFields = ['name', 'description', 'categories', 'sellingPrice', 'dosage', 'dosageUnit', 'quantity', 'expirationDate'];
    const newErrors = {};
    for (const field of requiredFields) {
      if (!newProduct[field]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    }

    if (newProduct.expirationDate) {
      const today = new Date();
      const expirationDate = new Date(newProduct.expirationDate);
      if (expirationDate <= today) {
        newErrors.expirationDate = 'Expiration date must be greater than today.';
      }
    }

    if (Object.keys(newErrors).length === 0) {
      setShowConfirmationModal(true);
    } else {
      setErrors(newErrors);
    }
  };

  const confirmCreateProduct = async () => {
    const createdBy = localStorage.getItem('id');
    const branch = localStorage.getItem('branches');
    const pharmacy = localStorage.getItem('pharmacy');

    const productData = {
      ...newProduct,
      createdBy,
      branch,
      pharmacy,
      expirationDate: [
        {
          quantity: newProduct.quantity,
          expiredDate: newProduct.expirationDate,
          createdAt: new Date(),
        },
      ],
      quantity: newProduct.quantity,
    };

    try {
      const response = await axios.post('http://localhost:5000/products/createProduct', productData);
      setResponseMessage(response.data.message); // Set the response message
      setShowResponseModal(true); // Show the response modal
      setProducts((prevProducts) => [...prevProducts, response.data]); // Update the products list
      setFilteredProducts((prevProducts) => [...prevProducts, response.data]); // Update the filtered products list
      setNewProduct({
        name: '',
        description: '',
        categories: '',
        quantity: 0,
        discount: 0,
        purchasePrice: 0,
        sellingPrice: 0,
        status: 'Available',
        CURR: 0,
        brand: '',
        image: '',
        dosage: '',
        dosageUnit: '',
        expirationDate: '',
      }); // Reset the form
    } catch (error) {
      setResponseMessage('Error creating product: ' + error.response?.data?.message || 'An unexpected error occurred.');
      setShowResponseModal(true); // Show the error message in the response modal
    }
    setShowConfirmationModal(false); // Close the confirmation modal
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false); // Close the response modal
    setShowAddProductForm(false); // Navigate back to the main card section
    setHeaderTitle('Product Management'); // Reset the header title
  };

  return (
    <div className="mt-1 p-4 border rounded bg-gray-100">
      <div className="flex mb-2">
        <button onClick={handleBack} className="px-2 mr-2 text-white rounded" style={{ background: brandColor }}>Back</button>
        <button
          type="button"
          className="px-4 py-1 text-white rounded"
          style={{ background: brandColor }}
          onClick={handleConfirmCreate}
        >
          Commit
        </button>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        {[
          { label: 'Product Name', type: 'text', name: 'name', placeholder: 'Product Name' },
          { label: 'Description', type: 'textarea', name: 'description', placeholder: 'Description' },
          { label: 'Categories', type: 'select', name: 'categories', placeholder: 'Categories' },
          { label: 'Quantity', type: 'number', name: 'quantity', placeholder: 'Quantity' },
          { label: 'Discount (%)', type: 'number', name: 'discount', placeholder: 'Discount (%)' },
          { label: 'Purchase Price', type: 'number', name: 'purchasePrice', placeholder: 'Purchase Price' },
          { label: 'Selling Price', type: 'number', name: 'sellingPrice', placeholder: 'Selling Price' },
          { label: 'Brand', type: 'text', name: 'brand', placeholder: 'Brand' },
          { label: 'Image URL', type: 'text', name: 'image', placeholder: 'Image URL' },
          { label: 'Dosage', type: 'text', name: 'dosage', placeholder: 'Dosage' },
          { label: 'Dosage Unit', type: 'text', name: 'dosageUnit', placeholder: 'Dosage Unit' },
          { label: 'Expiration Date', type: 'date', name: 'expirationDate', placeholder: 'Expiration Date' },
        ].map((field, index) => (
          <div key={index} className="flex items-center mb-2">
            <label className="block w-1/3 pr-2">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                placeholder={field.placeholder}
                value={newProduct[field.name]}
                onChange={handleNewProductChange}
                required
                className="py-1 px-2 border rounded bg-white w-1/2"
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                value={newProduct[field.name]}
                onChange={handleNewProductChange}
                required
                className="py-1 px-2 border rounded bg-white w-1/2"
              >
                <option value="" disabled>Select a category</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={newProduct[field.name]}
                onChange={handleNewProductChange}
                required
                className="py-1 px-2 border rounded bg-white w-1/2"
              />
            )}
            {errors[field.name] && <span className="text-red-500 text-sm ml-2">{errors[field.name]}</span>}
          </div>
        ))}
      </form>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <Modal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          message="Are you sure you want to create this product?"
          onConfirm={confirmCreateProduct}
          brandColor={brandColor}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <Modal
          isOpen={showResponseModal}
          onClose={handleCloseResponseModal}
          message={responseMessage}
          brandColor={brandColor}
          onConfirm={handleCloseResponseModal} // Only an "OK" button to close the modal
        />
      )}
    </div>
  );
};

export default AddProductForm;