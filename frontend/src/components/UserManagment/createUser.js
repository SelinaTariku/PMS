import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from '../API/userApi';
import Modal from '../Modal';
import axios from 'axios';

const PhoneRegex = /^(0[9|7][0-9]{8}|(\+251[9|7][0-9]{8})|(\+25111[0-9]{8})|011[0-9]{8})$/;
const EmailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,3}$/;

const CreateUser = ({
  userData,
  setErrors,
  errors,
  brandColor,
  isAdmin,
  onCommit,
  handleCancel,
}) => {
  const [localuserData, setLocaluserData] = useState(userData || {});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmCommit, setConfirmCommit] = useState(false);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    setLocaluserData(userData || {});
    setErrors({});
  }, [userData]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/role/getAllRoles');
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const pharmacy = isAdmin ? userData.pharmacy : localStorage.getItem('pharmacy');
        console.log("Pharmacy ID from Localstorage", pharmacy)
        const response = await axios.get(`http://localhost:5000/branches/getBranchesByPharmacyId/${pharmacy}`);
        setBranches(response.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    };

    fetchBranches();
  }, [userData.pharmacy, isAdmin]);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/pharmacies/getAllPharmacies');
        setPharmacies(response.data);
      } catch (error) {
        console.error("Error fetching pharmacies:", error);
      }
    };

    fetchPharmacies();
  }, []);

  const validateField = (fieldName, value) => {
    const validationErrors = { ...errors };

    // Validate Full Name
    if (fieldName === 'fullName') {
      const fullNameParts = value.trim().split(' ');
      if (fullNameParts.length !== 2 || 
          fullNameParts[0].length < 3 || 
          !/^[a-zA-Z]+$/.test(fullNameParts[0]) || 
          fullNameParts[1].length < 3 || 
          !/^[a-zA-Z]+$/.test(fullNameParts[1])) {
        validationErrors[fieldName] = 'Invalid Name';
      } else {
        delete validationErrors[fieldName];
      }
    }

    const requiredFields = [
      { path: 'status', label: 'Status' },
      { path: 'street', label: 'Street' },
      { path: 'city', label: 'City' },
      { path: 'state', label: 'State' },
      { path: 'phone', label: 'Phone' },
      { path: 'role', label: 'Role' },
    ];

    if (!isAdmin) {
      requiredFields.push({ path: 'pharmacy', label: 'Pharmacy' });
    }

    const field = requiredFields.find((f) => f.path === fieldName);
    if (field) {
      if (!value || value.trim() === '') {
        validationErrors[fieldName] = `${field.label} is required.`;
      } else {
        delete validationErrors[fieldName]; 
      }
    }

    if (fieldName === 'phone' && !PhoneRegex.test(value)) {
      validationErrors.phone = 'Invalid phone number.';
    }

    if (fieldName === 'email') {
      if (!EmailRegex.test(value)) {
        validationErrors.email = 'Invalid email.';
      } else {
        delete validationErrors.email; 
      }
    }

    setErrors(validationErrors);
    console.log("Current errors after validation:", validationErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name}, New Value: ${value}`);

    setLocaluserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const validateFields = () => {
    const validationErrors = {};
    const requiredFields = [
      'fullName', 'status', 'street', 'city',
      'state', 'phone', 'email', 'role'
    ];

    requiredFields.forEach((field) => {
      const value = localuserData[field]?.trim() || '';
      if (!value) {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      console.log("Validation errors detected:", validationErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleCommit = () => {
    console.log("Checking for changes before commit...");

    const isValid = validateFields();
    if (!isValid) {
      return; 
    }
    if (hasChanges()) {
      setConfirmCommit(true);
    } else {
      setErrors({}); 
    }
  };

  const confirmCommitChanges = async () => {
    const changes = {};
    for (const key in localuserData) {
      if (localuserData[key] !== userData[key]) {
        changes[key] = localuserData[key];
      }
    }

    if (Object.keys(changes).length === 0) {
      setModalMessage('No record detected to create User.');
      setModalOpen(true);
      setConfirmCommit(false);
      return;
    }

    // Include pharmacy from localStorage if isAdmin is false
    if (!isAdmin) {
      const pharmacyId = localStorage.getItem('pharmacy');
      changes.pharmacy = pharmacyId || ""; // Set to empty string if not found
    }

    try {
      console.log("Submitting changes:", changes);

      if(!isAdmin)
      {
        changes.pharmacy=localStorage.getItem('pharmacy')
      }
      console.log("Pharmacy ID from submitted data", changes.pharmacy)

      const response = await PharmacyAPI.createUserData(changes);
      console.log("Response Message:", response); 

      setModalMessage(response.message || 'User created successfully!');
    } catch (error) {
      console.error('Error updating User:', error);
      setModalMessage('Failed to update User. Please try again.');
    } finally {
      setModalOpen(true); 
      setConfirmCommit(false);
    }
  };

  const hasChanges = () => {
    for (const key in localuserData) {
      if (localuserData[key] !== userData[key]) {
        console.log(`Change detected in field: ${key}`);
        return true;
      }
    }
    console.log("No changes detected.");
    return false;
  };

  const handleClear = () => {
    setLocaluserData({}); 
    setErrors({}); 
  };

  const renderInputField = (label, name, value, type = 'text') => (
    <div className="flex items-center space-x-2 ">
      <label className="w-32 text-right ">{label}</label>
      <input
        type={type}
        name={name}
        className={`flex-grow h-10 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleInputChange}
        placeholder={label}
      />
      {errors[name] && (
        <span className="text-red-500 text-sm">{errors[name]}</span>
      )}
    </div>
  );

  const renderSelectField = (label, name, value, options) => (
    <div className="flex items-center space-x-2">
      <label className="w-32 text-right">{label}</label>
      <select
        name={name}
        className={`flex-grow h-10 p-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleInputChange}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {errors[name] && (
        <span className="text-red-500 text-sm">{errors[name]}</span>
      )}
    </div>
  );

  const renderFields = () => {
    const fields = [
      { label: 'Full Name', name: 'fullName', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
      { label: 'Phone', name: 'phone', type: 'text' },
      ...(isAdmin ? [] : [{
        label: 'Branch', 
        name: 'branches', 
        type: 'select', 
        options: branches.map(branch => ({
          value: branch._id,
          label: `${branch.name} (${branch.mnemonic})`
        })) 
      }]),
      { 
        label: 'Role', 
        name: 'role', 
        type: 'select', 
        options: roles.filter(role => isAdmin ? role.level === 'Admin' : role.level === 'Pharmacy').map(role => ({ 
          value: role._id,
          label: role.name 
        })) 
      },
      {
        label: 'Status', 
        name: 'status', 
        type: 'select', 
        options: [
          { value: 'Active', label: 'Active' },
          { value: 'Disabled', label: 'Disabled' },
        ]
      },
      { label: 'Address', name: 'street', type: 'text' },
      { label: 'City', name: 'city', type: 'text' },
      { label: 'State', name: 'state', type: 'text' },
      ...(isAdmin ? [{ 
        label: 'Pharmacy', 
        name: 'pharmacy', 
        type: 'select', 
        options: pharmacies.map(pharmacy => ({
          value: pharmacy._id,
          label: `${pharmacy.name} (${pharmacy.mnemonic})`
        })) 
      }] : []),
    ];
  
    return (
      <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <h2 className="text-2xl font-bold ml-2 mb-3" style={{ color: brandColor }}>
          Update User
        </h2>
        <div className="flex justify-left items-center mb-4">
          <button
            className="flex items-center text-white px-3 py-2 rounded transition duration-300 hover:shadow-lg"
            style={{ backgroundColor: brandColor }}
            onClick={handleCancel}
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            <span className="ml-1"></span>
          </button>
          <button
            onClick={handleClear}
            className="text-white px-4 py-1 ml-2 rounded transition duration-200"
            style={{ backgroundColor: brandColor }}
          >
            Clear
          </button>
          <button
            onClick={handleCommit}
            className="text-white px-4 py-1 ml-2 rounded transition duration-200"
            style={{ backgroundColor: brandColor }}
          >
            Commit
          </button>
        </div>
  
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field) => {
            const value = localuserData[field.name] || '';
            if (field.type === 'select') {
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

export default CreateUser;