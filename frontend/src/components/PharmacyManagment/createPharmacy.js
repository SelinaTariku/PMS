import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from '../API/pharmacyApi';
import Modal from '../Modal';

const PhoneRegex = /^(0[9|7][0-9]{8}|(\+251[9|7][0-9]{8})|(\+25111[0-9]{8})|011[0-9]{8})$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;

const CreatePharmacy = ({ brandColor, onCommit, handleCancel }) => {
  const initialPharmacyData = {
    name: '',
    logo: '',
    brandColor: '#000000',
    street: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenceDocument: '',
    licenseExpirationDate: '',
  };

  const [localPharmacyData, setLocalPharmacyData] = useState(initialPharmacyData);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmCommit, setConfirmCommit] = useState(false);
  const [errors, setErrors] = useState({});

  const validateField = (fieldName, value) => {
    const validationErrors = { ...errors };
    const requiredFields = [
      { path: 'name', label: 'Pharmacy Name' },
      { path: 'logo', label: 'Logo' },
      { path: 'brandColor', label: 'Brand Color' },
      { path: 'street', label: 'Address' },
      { path: 'city', label: 'City' },
      { path: 'state', label: 'State' },
      { path: 'phone', label: 'Phone' },
      { path: 'email', label: 'Email' },
      { path: 'licenseNumber', label: 'License Number' },
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

    if (fieldName === 'name') {
      if (value.length < 3 || !/^[a-zA-Z\s]+$/.test(value)) {
        validationErrors.name = 'Invalid Name.';
      }
    }

    if (fieldName === 'phone' && !PhoneRegex.test(value)) {
      validationErrors.phone = 'Invalid phone number format.';
    }

    if (fieldName === 'email' && !EmailRegex.test(value)) {
      validationErrors.email = 'Invalid email format.';
    }

    if (fieldName === 'licenseExpirationDate') {
      const expirationDate = new Date(value);
      const today = new Date();
      expirationDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (expirationDate <= today) {
        validationErrors.licenseExpirationDate = 'License has already expired. Please renew it before registration.';
      }
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
      'name', 'logo', 'brandColor', 'street', 'city',
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
    if (validateFields()) {
      setConfirmCommit(true);
    }
  };

  const handleClear = () => {
    setLocalPharmacyData(initialPharmacyData);
    setErrors({});
  };

  const confirmCommitChanges = async () => {
    try {
      const createdBy = localStorage.getItem('id');
      const dataToSend = {
        ...localPharmacyData,
        createdBy: createdBy,
      };
      console.log("Current Pharmacy Data:", dataToSend);

      const response = await PharmacyAPI.createData(dataToSend);
      console.log("API Response:", response);

      setModalMessage(response.message || 'Pharmacy created successfully!');
    } catch (error) {
      console.error('Error creating pharmacy:', error);
      setModalMessage('Failed to create pharmacy. Please try again.');
    } finally {
      setModalOpen(true);
      setConfirmCommit(false);
    }
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
        className="w-16 h-8 p-0 border-0 rounded-lg"
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

  const renderFields = () => {
    const fields = [
      { label: 'Pharmacy Name', name: 'name', type: 'text' },
      { label: 'Logo', name: 'logo', type: 'file', accept: 'image/*' },
      { label: 'Brand Color', name: 'brandColor', type: 'color' },
      { label: 'Address', name: 'street', type: 'text' },
      { label: 'City', name: 'city', type: 'text' },
      { label: 'State', name: 'state', type: 'text' },
      { label: 'Phone', name: 'phone', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'License Number', name: 'licenseNumber', type: 'text' },
      { label: 'License Document', name: 'licenceDocument', type: 'file', accept: '.pdf' },
      { label: 'License Expiration Date', name: 'licenseExpirationDate', type: 'date' },
    ];

    return (
      <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="flex space-x-1 mb-5">
          <button
            className="flex items-center text-white px-3 rounded transition duration-300 hover:shadow-lg"
            style={{ backgroundColor: brandColor }}
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
          </button>
          <button
            className="flex items-center text-white px-5 rounded transition duration-300 hover:shadow-lg"
            style={{ backgroundColor: brandColor }}
            onClick={handleClear}
          >
            Clear
          </button>
          <button
            onClick={handleCommit}
            className="text-white px-4 py-1 rounded transition duration-200"
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

export default CreatePharmacy;