import React, { useState } from 'react';
import { FaPen } from 'react-icons/fa'; // Importing the pen icon
import Modal from '../Modal'; // Importing the Modal component

const ProductDetails = ({ product, onEditChange, onSave, onBack, brandColor, branchDetails, pharmacyDetails }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  // Defensive check for product existence
  if (!product) {
    return <div className="p-4">Loading...</div>; // Loading state if product is undefined
  }

  const categories = [
    "Pain Reliever", "Antibiotic", "Vitamin", "Antihistamine", "Cough Suppressant",
    "Decongestant", "Anti-inflammatory", "Allergy Relief", "Digestive Aid",
    "Skin Treatment", "First Aid", "Heart Health",
    "Blood Pressure", "Diabetes Care", "Weight Management", "Sleep Aid",
    "Mood Support", "Nutritional Supplement", "Herbal Remedy", "Homeopathic",
    "Immunity Booster", "Respiratory Health", "Other"
  ];

  const handleSave = () => {
    setShowConfirmationModal(true); // Open confirmation modal
  };

  const confirmUpdate = async () => {
    const updatedProduct = {
      ...product,
      updatedBy: localStorage.getItem('userId'),
      branch: localStorage.getItem('branches'),
      pharmacy: localStorage.getItem('Pharmacy'),
    };

    try {
      const response = await fetch(`http://localhost:5000/products/updateProduct/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await response.json();
      if (response.ok) {
        onSave(); // Call the save function passed as a prop
        setResponseMessage('Changes saved successfully!');
      } else {
        setResponseMessage(data.message || 'Error saving changes. Please try again.');
      }
      setShowResponseModal(true); // Show response modal
    } catch (error) {
      console.error('Error updating product:', error);
      setResponseMessage('Error saving changes. Please try again.');
      setShowResponseModal(true); // Show response modal
    }

    setShowConfirmationModal(false); // Close confirmation modal
    setIsEditing(false); // Exit editing mode after saving
  };

  return (
    <div className="p-4 border rounded-lg shadow-md relative bg-white">
      <div className="flex justify-between mb-1">
        <button
          onClick={onBack}
          className="text-white py-1 px-2 rounded"
          style={{ background: brandColor }}
        >
          Back
        </button>

        <div className="flex items-center">
          {!isEditing && (
            <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
              <FaPen size={20} color={brandColor} />
            </div>
          )}
          {isEditing && (
            <button
              onClick={handleSave}
              className="text-white px-2 py-1 rounded ml-2"
              style={{ background: brandColor }}
            >
              Save Changes
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        {/* Display fields or editable fields based on editing state */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={onEditChange}
              className="py-1 px-2 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.name}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Description:</label>
          {isEditing ? (
            <textarea
              name="description"
              value={product.description}
              onChange={onEditChange}
              className="px-2 py-2 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.description}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Brand:</label>
          {isEditing ? (
            <input
              type="text"
              name="brand"
              value={product.brand}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.brand}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Image URL:</label>
          {isEditing ? (
            <input
              type="text"
              name="image"
              value={product.image}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.image}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Category:</label>
          {isEditing ? (
            <select
              name="categories"
              value={product.categories}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          ) : (
            <p className="w-2/3">{product.categories}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Dosage:</label>
          {isEditing ? (
            <input
              type="number"
              name="dosage"
              value={product.dosage}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.dosage}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Dosage Unit:</label>
          {isEditing ? (
            <input
              type="text"
              name="dosageUnit"
              value={product.dosageUnit}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.dosageUnit}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Quantity:</label>
          {isEditing ? (
            <input
              type="number"
              name="quantity"
              value={product.quantity}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.quantity}</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Discount:</label>
          {isEditing ? (
            <input
              type="number"
              name="discount"
              value={product.discount}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3 px-2 py-1">{product.discount}%</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Selling Price:</label>
          {isEditing ? (
            <input
              type="number"
              name="sellingPrice"
              value={product.sellingPrice}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3 px-2 py-1">{product.sellingPrice} Birr</p>
          )}
        </div>

        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Status:</label>
          {isEditing ? (
            <select
              name="status"
              value={product.status}
              onChange={onEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          ) : (
            <p className="w-2/3 px-2 py-1">{product.status}</p>
          )}
        </div>
      </div>

      {/* Additional Product Info */}
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <p className="font-semibold">Pharmacy: <span className="font-normal">{pharmacyDetails?.name + " Pharmacy " + branchDetails?.name + " Branch"}</span></p>
        <p className="font-semibold">Expiration Date: <span className="font-normal">{product.expirationDate[0]?.expiredDate.split('T')[0]}</span></p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <Modal 
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          message="Are you sure you want to save changes?"
          onConfirm={confirmUpdate}
          brandColor={brandColor}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && (
        <Modal 
          isOpen={showResponseModal}
          onClose={() => setShowResponseModal(false)}
          message={responseMessage}
          brandColor={brandColor}
        />
      )}
    </div>
  );
};

export default ProductDetails;