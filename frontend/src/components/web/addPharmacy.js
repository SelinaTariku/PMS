import React, { useState } from 'react';
import PharmacyAPI from '../API/pharmacyApi';
import logo from '../../assets/Image/logo.png';

const PhoneRegex = /^(0[9|7][0-9]{8}|(\+251[9|7][0-9]{8})|(\+25111[0-9]{8})|011[0-9]{8})$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;
const NameRegex = /^[a-zA-Z\s'-]+$/;

const CreatePharmacy = ({ onCommit, handleCancel }) => {
  const initialPharmacyData = {
    name: '',
    logo: logo,
    brandColor: '#1E467A',
    street: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenceDocument: '',
    licenseExpirationDate: '',
    ownerFullName: '',
    ownerEmail: '',
    ownerPhone: ''
  };

  const states = [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Central Ethiopia',
    'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali',
    'South Ethiopia', 'South West Ethiopia Peoples', 'Tigray'
  ];

  const [localPharmacyData, setLocalPharmacyData] = useState(initialPharmacyData);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: '', isSuccess: false });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const validateField = (fieldName, value) => {
    const validationErrors = { ...errors };
    const requiredFields = [
      { path: 'name', label: 'Pharmacy Name' },
      { path: 'TIN', label: 'TIN' },
      { path: 'phone', label: 'Phone' },
      { path: 'email', label: 'Email' },
      { path: 'licenseNumber', label: 'License Number' },
      { path: 'licenceDocument', label: 'License Document' },
      { path: 'licenseExpirationDate', label: 'License Expiration Date' },
      { path: 'ownerFullName', label: 'Owner Full Name' },
    ];

    const field = requiredFields.find((f) => f.path === fieldName);
    if (field) {
      if (!value || value.trim() === '') {
        validationErrors[fieldName] = `${field.label} is required.`;
      } else {
        delete validationErrors[fieldName];
      }
    }

    if (fieldName === 'name' && (value.length < 3 || !NameRegex.test(value))) {
      validationErrors.name = 'Pharmacy name must be at least 3 characters and contain only letters';
    }

    if (fieldName === 'ownerFullName' && (value.length < 3 || !NameRegex.test(value))) {
      validationErrors.ownerFullName = 'Owner name must be at least 3 characters and contain only letters';
    }

    if ((fieldName === 'phone' || fieldName === 'ownerPhone') && !PhoneRegex.test(value)) {
      validationErrors[fieldName] = 'Invalid phone number format. Use format: 0912345678 or +251912345678';
    }

    if ((fieldName === 'email' || fieldName === 'ownerEmail') && !EmailRegex.test(value)) {
      validationErrors[fieldName] = 'Invalid email format. Use format: example@domain.com';
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
      'name','TIN', 'phone', 'email', 'licenseNumber', 'licenceDocument', 
      'licenseExpirationDate', 'ownerFullName',
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

  const handleCommit = async () => {
    if (validateFields()) {
      try {
        const dataToSend = {
          ...localPharmacyData,
          createdBy: '67e26257fced9fcf67698bee',
        };

        const response = await PharmacyAPI.createData(dataToSend);
        
        if (response.success) {
          setNotification({
            message: response.message || 'Pharmacy created successfully!',
            isSuccess: true
          });
          setIsModalOpen(true);
        } else {
          setNotification({
            message: response.message || "Duplicated License Number",
            isSuccess: false
          });
          setIsModalOpen(true);
        }
      } catch (error) {
        console.error('Error creating pharmacy:', error);
        setNotification({
          message: 'Failed to create pharmacy. Please try again.',
          isSuccess: false
        });
        setIsModalOpen(true);
      }
    }
  };

  const handleClear = () => {
    setLocalPharmacyData(initialPharmacyData);
    setErrors({});
    setNotification({ message: '', isSuccess: false });
  };

  const renderInputField = (label, name, value, type = 'text') => (
    <div className="flex items-center space-x-2 mb-2">
      <label className="w-32 text-right">
        {label} {['name','TIN', 'phone', 'email', 'licenseNumber', 'licenceDocument', 
                  'licenseExpirationDate', 'ownerFullName'].includes(name) && 
                  <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        className={`flex-grow h-8 p-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleInputChange}
        placeholder={label}
      />
      {errors[name] && <span className="text-red-500 text-sm">{errors[name]}</span>}
    </div>
  );

  const renderDropdown = (label, name, value, options) => (
    <div className="flex items-center space-x-2 mb-2">
      <label className="w-32 text-right">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleInputChange}
        className={`flex-grow h-8 p-1 border rounded-lg shadow-sm focus:outline-none transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {errors[name] && <span className="text-red-500">{errors[name]}</span>}
    </div>
  );

  const renderFileField = (label, name, documentUrl, accept) => (
    <div className="flex items-center space-x-2 mb-1">
      <label className="w-32 text-right">
        {label} {['licenceDocument'].includes(name) && <span className="text-red-500">*</span>}
      </label>
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
          className={`h-8 p-1 border rounded-lg shadow-sm focus:outline-none transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
          onChange={(e) => handleFileChange(e, name)}
        />
        {errors[name] && <span className="text-red-500">{errors[name]}</span>}
      </div>
    </div>
  );

  const renderColorField = (label, name, value) => (
    <div className="flex items-center space-x-2 mb-1">
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
    <div className="flex items-center space-x-2 mb-1">
      <label className="w-32 text-right font-semibold">{label} <span className="text-red-500">*</span></label>
      <input
        type="date"
        name={name}
        className={`flex-grow h-8 p-1 border rounded-lg shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value ? value.split('T')[0] : ''}
        onChange={handleInputChange}
      />
      {errors[name] && <span className="text-red-500">{errors[name]}</span>}
    </div>
  );

  const NotificationModal = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center"> 
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#1E467A' }}>
            {notification.isSuccess ? 'Success!' : 'Notice'}
          </h3>
          <p className="mb-4">{notification.message}</p>
        </div>
        <div className="flex justify-center">
          <button
            className="px-4 py-2 rounded text-white transition duration-200 hover:shadow-lg"
            style={{ backgroundColor: '#1E467A' }}
            onClick={() => {
              setIsModalOpen(false);
              if (notification.isSuccess) {
                handleClear();
              }
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-5 ml-5 mt-2 bg-white rounded-lg shadow-lg min-h-screen mt-28 pb-5">
      <h2 className="text-2xl font-semibold mb-1 py-3" style={{ color: '#1E467A' }}>
        Register Your Pharmacy
      </h2>
      <p>
        Thank you for choosing us! Please fill out the details below to register your pharmacy.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>General Information</h3>
          {renderInputField('Pharmacy Name', 'name', localPharmacyData.name)}
          {renderInputField('TIN', 'TIN', localPharmacyData.TIN)}
          {renderFileField('Logo', 'logo', localPharmacyData.logo, 'image/*')}
          {renderColorField('Brand Color', 'brandColor', localPharmacyData.brandColor)}
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>Owner Information</h3>
          {renderInputField('Owner Full Name', 'ownerFullName', localPharmacyData.ownerFullName)}
          {renderInputField('Phone', 'phone', localPharmacyData.phone)}
          {renderInputField('Email', 'email', localPharmacyData.email, 'email')}
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>Address</h3>
          {renderInputField('Address', 'street', localPharmacyData.street)}
          {renderInputField('City', 'city', localPharmacyData.city)}
          {renderDropdown('State', 'state', localPharmacyData.state, states)}
        </div>

        <div className="border p-4 rounded-lg">
          <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>License Information</h3>
          {renderInputField('License Number', 'licenseNumber', localPharmacyData.licenseNumber)}
          {renderFileField('License Document', 'licenceDocument', localPharmacyData.licenceDocument, '.pdf')}
          {renderDateField('License Expiration Date', 'licenseExpirationDate', localPharmacyData.licenseExpirationDate)}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="flex items-center text-white py-1 px-4 rounded transition duration-300 hover:shadow-lg"
          style={{ backgroundColor: '#1E467A' }}
          onClick={handleClear}
        >
          Clear
        </button>
        <button
          onClick={handleCommit}
          className="ml-4 text-white py-2 px-4 rounded transition duration-200"
          style={{ backgroundColor: '#1E467A' }}
        >
          Register Pharmacy
        </button>
      </div>

      {isModalOpen && <NotificationModal />}
    </div>
  );
};

export default CreatePharmacy;