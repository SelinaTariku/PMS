import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FaArrowLeft } from "react-icons/fa";
import Modal from '../Modal';

const categories = [
  "Pain Reliever", "Antibiotic", "Vitamin", "Antihistamine", "Cough Suppressant",
  "Decongestant", "Anti-inflammatory", "Allergy Relief", "Digestive Aid",
  "Skin Treatment", "Beauty and Personal Care", "First Aid", "Heart Health",
  "Blood Pressure", "Diabetes Care", "Weight Management", "Sleep Aid",
  "Mood Support", "Nutritional Supplement", "Herbal Remedy", "Homeopathic",
  "Immunity Booster", "Respiratory Health", "Other"
];

const dosageUnits = ["mg", "g", "ml", "L", "tsp", "tbsp", "capsule", "tablet", "drop", "IU"];

const AddProductForm = ({ 
  handleBack, 
  onAddProduct,
  brandColor
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categories: '',
    discount: 0,
    purchasePrice: '',
    sellingPrice: '',
    status: 'Available',
    CURR: 0,
    brand: '',
    image: '',
    dosage: '',
    dosageUnit: '',
    expirationDate: '',
    outOfStock:''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'name', 'description', 'categories', 'expirationDate'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.expirationDate) {
      const today = new Date();
      const expirationDate = new Date(formData.expirationDate);
      if (expirationDate <= today) {
        newErrors.expirationDate = 'Expiration date must be in the future';
      }
    }

    if (formData.sellingPrice && formData.purchasePrice && 
        parseFloat(formData.sellingPrice) <= parseFloat(formData.purchasePrice)) {
      newErrors.sellingPrice = 'Selling price must be greater than purchase price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmationModal(true);
    }
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmationModal(false);

    try {
      const createdBy = localStorage.getItem('id');
      const branch = localStorage.getItem('branches');
      const pharmacy = localStorage.getItem('pharmacy');

      const productData = {
        ...formData,
        createdBy,
        branch,
        pharmacy,
        expirationDate: [{
          quantity: formData.quantity,
          expiredDate: formData.expirationDate,
          createdAt: new Date().toISOString()
        }]
      };

      const response = await onAddProduct(productData);
      
      // Reset form on success
      if (response) {
        setResponseMessage('Product created successfully!');
        setShowResponseModal(true);
        setFormData({
          name: '',
          description: '',
          categories: '',
          quantity: '',
          discount: 0,
          purchasePrice: '',
          sellingPrice: '',
          status: 'Available',
          CURR: 0,
          brand: '',
          image: '',
          dosage: '',
          dosageUnit: '',
          expirationDate: '',
          outOfStock:'',
        });
      }
    } catch (error) {
      setResponseMessage(error.response?.data?.message || 'Failed to create product. Please try again.');
      setShowResponseModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
  };

  const fields = [
    { label: 'Product Name', name: 'name', type: 'text', required: true },
    { label: 'Description', name: 'description', type: 'textarea', required: true },
    { label: 'Category', name: 'categories', type: 'select', options: categories, required: true },
    { label: 'Brand', name: 'brand', type: 'text', required: false },
    { label: 'Image URL', name: 'image', type: 'text', required: false },
    { label: 'Dosage', name: 'dosage', type: 'number', required: true },
    { label: 'Dosage Unit', name: 'dosageUnit', type: 'select', options: dosageUnits, required: true },
    { label: 'Quantity', name: 'quantity', type: 'number', required: true },
    { label: 'Purchase Price (Birr)', name: 'purchasePrice', type: 'number', required: false },
    { label: 'Selling Price (Birr)', name: 'sellingPrice', type: 'number', required: true },
    { label: 'Discount (%)', name: 'discount', type: 'number', required: false, min: 0, max: 100 },
    { label: 'Expiration Date', name: 'expirationDate', type: 'date', required: true },
    { label: 'Out Of Stock Quantity', name: 'outOfStock', type: 'number', required: true },
  ];

  return (
    
    <div className="container max-h-80 min-h-80 mb-10 p-4">
      <div className="flex items-center mb-3">
        
         <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={handleBack}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>
        <h2 className="text-2xl ml-5 font-bold" style={{ color: brandColor }}>
          Add Product
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        
        <div className="flex justify-end">
          
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting}
            className="px-2 py-2 rounded text-sm font-medium text-white flex items-center gap-2"
            style={{ backgroundColor: brandColor }}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" className="opacity-25" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} />
                Commit
              </>
            )}
          </motion.button>
        </div>
        {fields.map((field) => (
          <div key={field.name} className="flex items-center space-x-2">
            <label className="block text-sm font-medium text-gray-700 w-1/3">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className={`w-2/3 p-1 border rounded ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                rows={3}
                required={field.required}
              />
            ) : field.type === 'select' ? (
              <select
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className={`w-2/3 p-1 border rounded ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                required={field.required}
              >
                <option value="">Select {field.label.toLowerCase()}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                min={field.min}
                max={field.max}
                step={field.type === 'number' ? 'any' : undefined}
                className={`w-2/3 p-1 border rounded ${errors[field.name] ? 'border-red-500' : 'border-gray-300'}`}
                required={field.required}
              />
            )}
            
            {errors[field.name] && (
              <p className="text-sm text-red-600 flex items-center mt-1 w-1/3">
                <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                {errors[field.name]}
              </p>
            )}
          </div>
        ))}

      </form>

      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={confirmSubmit}
        title="Confirm Product Creation"
        message="Are you sure you want to create this product?"
        confirmText="Create Product"
        cancelText="Cancel"
        brandColor={brandColor}
      />

      <Modal
        isOpen={showResponseModal}
        onClose={handleCloseResponseModal}
        title="Response"
        message={responseMessage}
        confirmText="OK"
        showCancel={false}
        brandColor={brandColor}
      />
    </div>
  );
};

export default AddProductForm;