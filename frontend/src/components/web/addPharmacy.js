import React, { useState } from 'react';
import PharmacyAPI from '../API/pharmacyApi';

const PhoneRegex = /^(0[9|7][0-9]{8}|(\+251[9|7][0-9]{8})|(\+25111[0-9]{8})|011[0-9]{8})$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;

const CreatePharmacy = ({ onCommit, handleCancel }) => {
  const initialPharmacyData = {
    name: '',
    logo: '',
    brandColor: '#1E467A',
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
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleCommit = async () => {
    if (validateFields()) {
      try {
        const dataToSend = {
          ...localPharmacyData,
          createdBy: '67c16eb86a23221a1a8b8938',
        };
        console.log("Current Pharmacy Data:", dataToSend);
  
        const response = await PharmacyAPI.createData(dataToSend);
        console.log("API Response:", response);
  
        if (response.success) {
          setNotification(response?.message || 'Pharmacy created successfully!');
        } else {
          setNotification(response?.message || "Duplicated License Number");
        }
      } catch (error) {
        console.error('Error creating pharmacy:', error);
        setNotification('Failed to create pharmacy. Please try again.');
      } finally {
        setIsModalOpen(true); // Ensure the modal opens to display the notification
      }
    }
  };

  const handleClear = () => {
    setLocalPharmacyData(initialPharmacyData);
    setErrors({});
    setNotification('');
  };

  const renderInputField = (label, name, value, type = 'text') => (
    <div className="flex items-center space-x-2 mb-2">
      <label className="w-32 text-right">{label}</label>
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

  const renderFileField = (label, name, documentUrl, accept) => (
    <div className="flex items-center space-x-2 mb-1">
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
      <label className="w-32 text-right font-semibold">{label}</label>
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
      <div className="p-5 ml-5 mt-2 bg-white rounded-lg shadow-lg min-h-screen mt-28 pb-5">
        <h2 className="text-2xl font-semibold mb-1 py-3" style={{ color: '#1E467A' }}>
          Register Your Pharmacy
        </h2>
        <p>
          Thank you for choosing us! Please fill out the details below to register your pharmacy. If you encounter any issues or need assistance, feel free to contact us. We're here to help!
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>General Information</h3>
            {fields.slice(0, 3).map((field) => {
              const value = localPharmacyData[field.name] || '';
              if (field.type === 'file') {
                return renderFileField(field.label, field.name, value, field.accept);
              } else if (field.type === 'color') {
                return renderColorField(field.label, field.name, value);
              } else {
                return renderInputField(field.label, field.name, value, field.type);
              }
            })}
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>Address</h3>
            {fields.slice(3, 6).map((field) => {
              const value = localPharmacyData[field.name] || '';
              return renderInputField(field.label, field.name, value, field.type);
            })}
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>Contact Information</h3>
            {fields.slice(6, 8).map((field) => {
              const value = localPharmacyData[field.name] || '';
              return renderInputField(field.label, field.name, value, field.type);
            })}
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-semibold mb-2" style={{ color: '#1E467A' }}>License Information</h3>
            {fields.slice(8, 11).map((field) => {
              const value = localPharmacyData[field.name] || '';
              if (field.type === 'file') {
                return renderFileField(field.label, field.name, value, field.accept);
              } else if (field.type === 'date') {
                return renderDateField(field.label, field.name, value);
              } else {
                return renderInputField(field.label, field.name, value, field.type);
              }
            })}
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

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-lg flex flex-col items-center">
              <h3 className="text-lg font-semibold" style={{ color: '#1E467A' }}>Notification</h3>
              <p className="text-center">{notification}</p>
              <button
                className="mt-4 text-white py-2 px-4 rounded"
                style={{ backgroundColor: '#1E467A' }}
                onClick={() => setIsModalOpen(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return <>{renderFields()}</>;
};

export default CreatePharmacy;