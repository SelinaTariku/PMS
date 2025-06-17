import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft } from "react-icons/fa";
import BranchAPI from '../API/branchAPI';
import Modal from '../Modal';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix the default icon issue with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const UpdateBranch = ({
  branchData,
  setErrors,
  errors,
  brandColor,
  onCommit,
  handleCancel,
}) => {
  const [localBranchData, setLocalBranchData] = useState(branchData || {});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmCommit, setConfirmCommit] = useState(false);
  const [pharmacies, setPharmacies] = useState([]);

  useEffect(() => {
    setLocalBranchData(branchData || {});
    setErrors({});
  }, [branchData]);

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

  const formatWorkingHours = (workingHours) => {
    return Object.entries(workingHours).map(([day, hours]) => (
      <div key={day}>
        <strong>{day}:</strong> {hours.start} - {hours.end || 'Closed'}
      </div>
    ));
  };

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setLocalBranchData((prevData) => ({
      ...prevData,
      location: { lat, lng }
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocalBranchData((prevData) => ({
            ...prevData,
            location: { lat: latitude, lng: longitude }
          }));
        },
        (error) => {
          console.error("Error getting current location:", error);
          setModalMessage("Unable to retrieve your location.");
          setModalOpen(true);
        }
      );
    } else {
      setModalMessage("Geolocation is not supported by this browser.");
      setModalOpen(true);
    }
  };

  const validateField = (fieldName, value) => {
    const validationErrors = { ...errors };

    const requiredFields = [
      { path: 'name', label: 'Branch Name' },
      { path: 'status', label: 'Status' },
      { path: 'pharmacyId', label: 'Pharmacy' },
    ];

    const field = requiredFields.find((f) => f.path === fieldName);
    if (field) {
      if (!value || value.trim() === '') {
        validationErrors[fieldName] = `${field.label} is required.`;
      } else {
        delete validationErrors[fieldName];
      }
    }

    setErrors(validationErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setLocalBranchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;

    setLocalBranchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setLocalBranchData((prevData) => ({
      ...prevData,
      workingHours: {
        ...prevData.workingHours,
        [day]: {
          ...prevData.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const validateFields = () => {
    const validationErrors = {};
    const requiredFields = [
      'name', 'status', 'pharmacyId'
    ];

    requiredFields.forEach((field) => {
      const value = localBranchData[field]?.trim() || '';
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
    for (const key in localBranchData) {
      if (localBranchData[key] !== branchData[key]) {
        changes[key] = localBranchData[key];
      }
    }

    if (Object.keys(changes).length === 0) {
      setModalMessage('No changes detected to update.');
      setModalOpen(true);
      setConfirmCommit(false);
      return;
    }

    // Add the updatedBy field from localStorage
    changes.updatedBy = localStorage.getItem('id');

    try {
      const response = await BranchAPI.updateBranch(branchData._id, changes);

      if (response.success) {
        setModalMessage(response.message || 'Branch information updated successfully!');
        onCommit({ ...localBranchData, _id: branchData._id });
        handleCancel();
      } else {
        setModalMessage(response.message || 'Failed to update Branch. Please try again.');
      }
    } catch (error) {
      console.error('Error updating Branch:', error);
      setModalMessage('Failed to update Branch. Please try again.');
    } finally {
      setModalOpen(true);
      setConfirmCommit(false);
    }
  };

  const hasChanges = () => {
    for (const key in localBranchData) {
      if (localBranchData[key] !== branchData[key]) {
        return true;
      }
    }
    return false;
  };

  const renderInputField = (label, name, value, type = 'text') => (
    <div className="flex items-center space-x-2 ">
      <label className="w-32 text-right">{label}</label>
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
    <div className="flex items-center space-x-2 mt-2">
      <label className="w-32 text-right">{label}</label>
      <select
        name={name}
        className={`flex-grow h-10 p-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 transition duration-200 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
        value={value}
        onChange={handleSelectChange}
      >
        <option value="">Select {label}</option>
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

  const renderWorkingHoursField = (day) => (
    <div className="flex items-center space-x-2">
      <label className="w-32">{day}</label>
      <input
        type="time"
        value={localBranchData.workingHours[day].start}
        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
        className="h-10 px-2 border rounded-lg shadow-sm"
      />
      <input
        type="time"
        value={localBranchData.workingHours[day].end}
        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
        className="h-10 px-2 border rounded-lg shadow-sm"
      />
    </div>
  );

  const renderFields = () => {
    const fields = [
      { label: 'Branch Name', name: 'name', type: 'text' },
      { label: 'Status', name: 'status', type: 'select', options: [
          { value: 'Open', label: 'Open' },
          { value: 'Closed', label: 'Closed' },
        ] 
      },
    ];

    return (
      <div className="container max-h-80 min-h-80 mb-10 p-4">
        <h2 className="text-2xl font-bold ml-2 mb-3" style={{ color: brandColor }}>
          Update Branch
        </h2>
        <div className="flex justify-left items-center mb-4">
           <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={handleCancel}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>

          <button
            onClick={handleCommit}
            className="text-white px-4 py-1 ml-2 rounded transition duration-200"
            style={{ backgroundColor: brandColor }}
          >
            Commit
          </button>
        </div>

        <div >
          {fields.map((field) => {
            const value = localBranchData[field.name] || '';
            if (field.type === 'select') {
              return renderSelectField(field.label, field.name, value, field.options);
            } else {
              return renderInputField(field.label, field.name, value, field.type);
            }
          })}
        </div>

        <div className=" pl-6 mt-2 ml-4">
          <h3 className="text-lg">Working Hours</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(localBranchData.workingHours).map(day => renderWorkingHoursField(day))}
          </div>
        </div>

        {/* Display the location on a map */}
        <div className="mt-2 ml-4 pl-6 mb-5">
          <div className="flex items-center">
            <h3 className="text-lg mr-2">Branch Location</h3>
            <button
              onClick={getCurrentLocation}
              className="text-white px-4 py-1 rounded transition duration-200"
              style={{ backgroundColor: brandColor }}
            >
              Get Current Location
            </button>
          </div>
          <MapContainer center={[localBranchData.location?.lat || 0, localBranchData.location?.lng || 0]} zoom={13} style={{ height: '300px', width: '100%' }} onClick={handleMapClick}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {localBranchData.location && (
              <Marker position={[localBranchData.location.lat, localBranchData.location.lng]}>
                <Popup>{localBranchData.name}</Popup>
              </Marker>
            )}
          </MapContainer>
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

export default UpdateBranch;