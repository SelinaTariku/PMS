import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from '../API/branchAPI';
import Modal from '../Modal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CreateBranch = ({ brandColor, handleCancel }) => {
  const initialBranchData = () => ({
    name: '',
    workingHours: {
      Monday: { start: '08:00', end: '17:00' },
      Tuesday: { start: '08:00', end: '17:00' },
      Wednesday: { start: '08:00', end: '17:00' },
      Thursday: { start: '08:00', end: '17:00' },
      Friday: { start: '08:00', end: '17:00' },
      Saturday: { start: '08:00', end: '17:00' },
      Sunday: { start: '08:00', end: '17:00' },
    },
    location: {
      lat: 9.03,
      lng: 38.74,
    },
  });

  const [localBranchData, setLocalBranchData] = useState(initialBranchData());
  const [currentLocation, setCurrentLocation] = useState({
    lat: 9.03,
    lng: 38.74,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setLocalBranchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

  const handleMapClick = (event) => {
    const { lat, lng } = event.latlng;
    setLocalBranchData((prevData) => ({
      ...prevData,
      location: { lat, lng },
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLocalBranchData((prevData) => ({
            ...prevData,
            location: { lat: latitude, lng: longitude },
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

  const validateFields = () => {
    const validationErrors = {};
    const requiredFields = ['name'];

    requiredFields.forEach((field) => {
      const value = localBranchData[field]?.trim() || '';
      if (!value) {
        validationErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });

    // Validate location
    if (!localBranchData.location.lat || !localBranchData.location.lng) {
      validationErrors.location = "Location is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      return validationErrors;
    }

    return {};
  };

  const handleCommit = async () => {
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setModalMessage('Please fill all required fields.');
      setModalOpen(true);
      return;
    }

    const changes = { ...localBranchData };
    changes.pharmacyId = localStorage.getItem('pharmacy');

    try {
      console.log("Branch creation req body ", changes);
      const response = await PharmacyAPI.createData(changes);
      setModalMessage(response.message || 'Branch created successfully!');
    } catch (error) {
      console.error('Error creating Branch:', error);
      setModalMessage('Failed to create Branch. Please try again.');
    } finally {
      setModalOpen(true);
    }
  };

  const renderWorkingHoursField = (day) => (
    <div className="flex items-center space-x-2 ">
      <label className="w-32">{day}</label>
      <input
        type="time"
        value={localBranchData.workingHours[day].start}
        onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
        className="h-10 px-2 py-1 border rounded-lg shadow-sm"
      />
      <input
        type="time"
        value={localBranchData.workingHours[day].end}
        onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
        className="h-10 px-2 py-1 border rounded-lg shadow-sm"
      />
    </div>
  );

  const renderFields = () => (
    <div className="p-2 bg-white rounded-lg shadow-lg max-h-87 overflow-y-auto">
      <h2 className="text-2xl font-bold ml-2 mb-1" style={{ color: brandColor }}>
        Create Branch
      </h2>
      <div className="flex justify-left items-center mb-4">
        <button
          className="flex items-center text-white px-3 py-1 rounded transition duration-300 hover:shadow-lg"
          style={{ backgroundColor: brandColor }}
          onClick={handleCancel}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
          <span className="ml-1">Back</span>
        </button>
        <button
          onClick={handleCommit}
          className="text-white px-4 py-1 ml-2 rounded transition duration-200"
          style={{ backgroundColor: brandColor }}
        >
          Commit
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <label className="w-32">Name</label>
        <input
          type="text"
          name="name"
          value={localBranchData.name}
          onChange={handleInputChange}
          className="flex-grow h-10 px-2 border rounded-lg shadow-sm"
          placeholder="Branch Name"
        />
      </div>

      <div className="mt-1">
        <h3 className="font-semibold">Working Hours</h3>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(localBranchData.workingHours).map(day => renderWorkingHoursField(day))}
        </div>
      </div>

      <div className="mt-1">
        <h3 className="font-semibold">Location</h3>
        <button
          onClick={getCurrentLocation}
          className="text-white px-4 py-1 ml-2 rounded transition duration-200"
          style={{ backgroundColor: brandColor }}
        >
          Get Current Location
        </button>
        <MapContainer
          center={[localBranchData.location.lat, localBranchData.location.lng]}
          zoom={10}
          style={{ height: "300px", width: "100%" }}
          onClick={handleMapClick}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Marker position={localBranchData.location} />
          <Marker position={currentLocation} icon={L.divIcon({ className: 'current-location-marker', html: '<div style="background-color: red; width: 10px; height: 10px; border-radius: 50%;"></div>' })} />
        </MapContainer>
      </div>

      <div className="mt-2">
        <h4 className="font-semibold">Selected Location:</h4>
        <p>Latitude: {localBranchData.location.lat.toFixed(6)}</p>
        <p>Longitude: {localBranchData.location.lng.toFixed(6)}</p>
      </div>
    </div>
  );

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
    </>
  );
};

export default CreateBranch;