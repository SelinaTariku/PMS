import React, { useState } from 'react';
import { FaPen,FaArrowLeft } from 'react-icons/fa';
import Modal from '../Modal';

const ProductDetails = ({ product, onBack, brandColor, branchDetails, pharmacyDetails, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [editedProduct, setEditedProduct] = useState({ ...product });

  // Defensive check for product existence
  if (!product) {
    return <div className="p-4">Loading...</div>;
  }

  const categories = [
    "Pain Reliever", "Antibiotic", "Vitamin", "Antihistamine", "Cough Suppressant",
    "Decongestant", "Anti-inflammatory", "Allergy Relief", "Digestive Aid",
    "Skin Treatment", "First Aid", "Heart Health",
    "Blood Pressure", "Diabetes Care", "Weight Management", "Sleep Aid",
    "Mood Support", "Nutritional Supplement", "Herbal Remedy", "Homeopathic",
    "Immunity Booster", "Respiratory Health", "Other"
  ];

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setShowConfirmationModal(true);
  };

  const confirmUpdate = async () => {
    try {
      await onSave(editedProduct);
      setResponseMessage('Changes saved successfully!');
      setIsEditing(false);
    } catch (error) {
      setResponseMessage(error.message || 'Error saving changes. Please try again.');
    } finally {
      setShowConfirmationModal(false);
      setShowResponseModal(true);
    }
  };

  return (
    <div className="container max-h-80 min-h-80 mb-10 p-6 bg-white">
      <div className="flex justify-between mb-1 ">
        
         <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={onBack}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>
        <div className="flex items-center ">
          {!isEditing ? (
            <div className="cursor-pointer" onClick={() => setIsEditing(true)}>
              <FaPen size={20} color={brandColor} />
            </div>
          ) : (
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

      <div className="bg-gray-100 p-4 rounded-lg shadow mb-4 ">

        <div className="flex items-center mb-2 ">
          <label className="block w-1/3 px-2 py-1 font-semibold">Name:</label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={editedProduct.name || ''}
              onChange={handleEditChange}
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
              value={editedProduct.description || ''}
              onChange={handleEditChange}
              className="px-2 py-2 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.description}</p>
          )}
        </div>

        {/* Brand Field */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Brand:</label>
          {isEditing ? (
            <input
              type="text"
              name="brand"
              value={editedProduct.brand || ''}
              onChange={handleEditChange}
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
              value={editedProduct.image || ''}
              onChange={handleEditChange}
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
              value={editedProduct.categories || ''}
              onChange={handleEditChange}
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
              value={editedProduct.dosage || ''}
              onChange={handleEditChange}
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
              value={editedProduct.dosageUnit || ''}
              onChange={handleEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.dosageUnit}</p>
          )}
        </div>

        {/* Quantity Field */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Quantity:</label>
          {isEditing ? (
            <input
              type="number"
              name="quantity"
              value={editedProduct.quantity || ''}
              onChange={handleEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3">{product.quantity}</p>
          )}
        </div>

        {/* Discount Field */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Discount:</label>
          {isEditing ? (
            <input
              type="number"
              name="discount"
              value={editedProduct.discount || ''}
              onChange={handleEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3 px-2 py-1">{product.discount}%</p>
          )}
        </div>

        {/* Selling Price Field */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Selling Price:</label>
          {isEditing ? (
            <input
              type="number"
              name="sellingPrice"
              value={editedProduct.sellingPrice || ''}
              onChange={handleEditChange}
              className="px-2 py-1 border border-gray-300 rounded-lg w-2/3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          ) : (
            <p className="w-2/3 px-2 py-1">{product.sellingPrice} Birr</p>
          )}
        </div>

        {/* Status Field */}
        <div className="flex items-center mb-2">
          <label className="block w-1/3 px-2 py-1 font-semibold">Status:</label>
          {isEditing ? (
            <select
              name="status"
              value={editedProduct.status || ''}
              onChange={handleEditChange}
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

      {/* Expired Products Section */}
      <div className="bg-red-100 p-4 rounded-lg shadow mb-4">
        <h2 className="font-semibold">All Expiration Dates</h2>
        {product.expirationDate.length > 0 ? (
          product.expirationDate.map(expiration => (
            <div key={expiration._id} className="flex justify-between">
              <p>{`Expired Date: ${new Date(expiration.expiredDate).toLocaleDateString()}`}</p>
              <p>{`Quantity: ${expiration.quantity}`}</p>
            </div>
          ))
        ) : (
          <p>No expiration dates available.</p>
        )}
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