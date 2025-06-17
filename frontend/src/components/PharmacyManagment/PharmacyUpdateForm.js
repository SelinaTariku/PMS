import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft, FaSpinner } from "react-icons/fa";
import PharmacyAPI from '../API/pharmacyApi';
import Modal from '../Modal';

const PhoneRegex = /^(0[9|7][0-9]{8}|(\+251[9|7][0-9]{8})|(\+25111[0-9]{8})|011[0-9]{8})$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;

const UpdatePharmacyForm = ({
  pharmacyData,
  setErrors,
  errors,
  brandColor,
  onCommit,
  handleCancel,
}) => {
  const [localPharmacyData, setLocalPharmacyData] = useState(pharmacyData || {});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmCommit, setConfirmCommit] = useState(false);

  useEffect(() => {
    setLocalPharmacyData(pharmacyData || {});
    setErrors({});
  }, [pharmacyData]);

  const validateField = (fieldName, value) => {
    const validationErrors = { ...errors };
    const requiredFields = [
      { path: 'logo', label: 'Logo' },
      { path: 'brandColor', label: 'Brand Color' },
      { path: 'status', label: 'Status' },
      { path: 'street', label: 'Address' },
      { path: 'city', label: 'City' },
      { path: 'state', label: 'State' },
      { path: 'phone', label: 'Phone' },
      { path: 'email', label: 'Email' },
      { path: 'licenceDocument', label: 'License Document' },
      { path: 'licenseExpirationDate', label: 'License Expiration Date' },
    ];

    const field = requiredFields.find((f) => f.path === fieldName);
    if (field) {
      if (!value || value.trim() === '') {
        validationErrors[fieldName] = `${field.label} is required.`;
      } else {
        delete validationErrors[fieldName];
      }
    }

    if (fieldName === 'phone' && !PhoneRegex.test(value)) {
      validationErrors.phone = 'Invalid phone number format.';
    }

    if (fieldName === 'email' && !EmailRegex.test(value)) {
      validationErrors.email = 'Invalid email format.';
    }

    setErrors(validationErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalPharmacyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleFileChange = (e, name) => {
    const file = e.target.files[0];

    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const validPdfTypes = ['application/pdf'];

      if (name === 'logo' && !validImageTypes.includes(file.type)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          logo: 'Invalid file type. Please upload an image (JPEG, PNG, GIF).',
        }));
        return;
      }

      if (name === 'licenceDocument' && !validPdfTypes.includes(file.type)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          licenceDocument: 'Invalid file type. Please upload a PDF document.',
        }));
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      setLocalPharmacyData((prevData) => ({ ...prevData, [name]: fileUrl }));
      validateField(name, fileUrl);
    }
  };

  const validateFields = () => {
    const validationErrors = {};
    const requiredFields = [
      'logo', 'brandColor', 'status', 'street', 'city',
      'state', 'phone', 'email', 'licenseNumber', 'licenceDocument', 'licenseExpirationDate'
    ];

    requiredFields.forEach((field) => {
      const value = localPharmacyData[field]?.trim() || '';
      if (!value) {
        validationErrors[field] = `${field} is required.`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleCommit = () => {
    if (hasChanges()) {
      const isValid = validateFields();
      if (isValid) {
        setConfirmCommit(true);
      }
    } else {
      setModalMessage('No changes detected to update.');
      setModalOpen(true);
    }
  };

  const confirmCommitChanges = async () => {
    const changes = {};
    for (const key in localPharmacyData) {
      if (localPharmacyData[key] !== pharmacyData[key]) {
        changes[key] = localPharmacyData[key];
      }
    }

    if (Object.keys(changes).length === 0) {
      setModalMessage('No changes detected to update.');
      setModalOpen(true);
      setConfirmCommit(false);
      return;
    }

    try {
      const response = await PharmacyAPI.updatePharmacy(pharmacyData._id, changes);

      if (response.success) {
        setModalMessage(response.message || 'Pharmacy information updated successfully!');
        onCommit({ ...localPharmacyData, _id: pharmacyData._id });
        handleCancel();
      } else {
        setModalMessage(response.message || 'Failed to update pharmacy. Please try again.');
      }
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      setModalMessage('Failed to update pharmacy. Please try again.');
    } finally {
      setModalOpen(true);
      setConfirmCommit(false);
    }
  };

  const hasChanges = () => {
    for (const key in localPharmacyData) {
      if (localPharmacyData[key] !== pharmacyData[key]) {
        return true;
      }
    }
    return false;
  };

  const renderInputField = (label, name, value, type = 'text') => (
    <div className="flex items-center space-x-2 mb-4">
      <label className="w-32 text-right">{label}</label>
      <input
        type={type}
        name={name}
        className={`flex-grow h-10 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleInputChange}
        placeholder={label}
      />
      {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
    </div>
  );

  const renderFileField = (label, name, documentUrl, accept) => (
    <div className="flex items-center space-x-2 mb-4">
      <label className="w-32 text-right">{label}</label>
      <div className="flex flex-col flex-grow">
        {name === 'logo' && localPharmacyData.logo && (
          <img
            src={localPharmacyData.logo}
            alt="Logo Preview"
            className="mb-2 w-20 h-10 object-contain border border-gray-300 rounded"
          />
        )}
        {name === 'licenceDocument' && documentUrl && (
          <div className="flex items-center mb-1">
            <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              View License Document
            </a>
          </div>
        )}
        <input
          type="file"
          name={name}
          accept={accept}
          className={`h-10 p-2 border rounded-lg shadow-sm focus:outline-none transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
          onChange={(e) => handleFileChange(e, name)}
        />
        {errors[name] && <span className="text-red-500">{errors[name]}</span>}
      </div>
    </div>
  );

  const renderColorField = (label, name, value) => (
    <div className="flex items-center space-x-2 mb-4">
      <label className="w-32 text-right">{label}</label>
      <input
        type="color"
        name={name}
        className="w-16 h-10 p-0 border-0 rounded-lg"
        value={value}
        onChange={handleInputChange}
      />
    </div>
  );

  const renderDateField = (label, name, value) => (
    <div className="flex items-center space-x-2 mb-4">
      <label className="w-32 text-right">{label}</label>
      <input
        type="date"
        name={name}
        className={`flex-grow h-10 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value ? value.split('T')[0] : ''}
        onChange={handleInputChange}
      />
      {errors[name] && <span className="text-red-500">{errors[name]}</span>}
    </div>
  );

  const renderSelectField = (label, name, value, options) => (
    <div className="flex items-center space-x-2 mb-4">
      <label className="w-32 text-right">{label}</label>
      <select
        name={name}
        className={`flex-grow h-10 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleInputChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {errors[name] && <span className="text-red-500">{errors[name]}</span>}
    </div>
  );

  const renderFields = () => {
    const fields = [
      { label: 'Logo', name: 'logo', type: 'file', accept: 'image/*' },
      { label: 'Brand Color', name: 'brandColor', type: 'color' },
      {
        label: 'Status', name: 'status', type: 'select', options: [
          { value: 'Active', label: 'Active' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Disabled', label: 'Disabled' },
        ]
      },
      { label: 'Address', name: 'street', type: 'text' },
      { label: 'City', name: 'city', type: 'text' },
      { label: 'State', name: 'state', type: 'text' },
      { label: 'Phone', name: 'phone', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'License Document', name: 'licenceDocument', type: 'file', accept: '.pdf' },
      { label: 'License Expiration Date', name: 'licenseExpirationDate', type: 'date' },
    ];

    return (
      <div className="p-4 mb-5 bg-white rounded-lg shadow-lg max-h-screen overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex justify-between items-center mb-5">
          <button
            className="p-2 rounded-full shadow hover:opacity-90 transition"
            style={{ backgroundColor: brandColor }}
            onClick={handleCancel}
            aria-label="Go back"
          >
            <FaArrowLeft className="text-white" />
          </button>
          <h2 className="text-2xl font-bold" style={{ color: brandColor }}>
            Update {pharmacyData.name} Pharmacy
          </h2>
          <button
            onClick={handleCommit}
            className="text-white py-1 px-3 rounded transition duration-200"
            style={{ backgroundColor: brandColor }}
          >
            Commit
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = localPharmacyData[field.name] || '';
            if (field.type === 'file') {
              return renderFileField(field.label, field.name, value, field.accept);
            } else if (field.type === 'color') {
              return renderColorField(field.label, field.name, value);
            } else if (field.type === 'date') {
              return renderDateField(field.label, field.name, value);
            } else if (field.type === 'select') {
              return renderSelectField(field.label, field.name, value, field.options);
            } else {
              return renderInputField(field.label, field.name, value, field.type);
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderFields()}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        brandColor={brandColor}
        onBack={handleCancel}
      />
      <Modal
        isOpen={confirmCommit}
        onClose={() => setConfirmCommit(false)}
        message="Are you sure you want to commit these changes?"
        brandColor={brandColor}
        onConfirm={confirmCommitChanges}
        onCancel={() => setConfirmCommit(false)}
      />
    </>
  );
};

export default UpdatePharmacyForm;