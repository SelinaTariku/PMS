import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";

const ViewBranchDetail = ({ branchData, brandColor, handleCancel }) => {
  const [activeTab, setActiveTab] = useState('General Information');
  const [pharmacyName, setPharmacyName] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPharmacy = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${branchData.pharmacyId}`);
        setPharmacyName(response.data.mnemonic);
      } catch (error) {
        console.error("Error fetching pharmacy data:", error);
      }
    };

    const fetchCreator = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/getUserById/${branchData.createdBy}`);
        setCreatedBy(response.data.email);
      } catch (error) {
        console.error("Error fetching creator data:", error);
      }
    };

    fetchPharmacy();
    fetchCreator();
    setLoading(false);
  }, [branchData.pharmacyId, branchData.createdBy]);

  const isOpen = () => {
    const today = new Date();
    const currentDay = today.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = today.toTimeString().slice(0, 5); // Get current time in HH:MM format

    const hours = branchData.workingHours[currentDay];
    if (hours && hours.start && hours.end) {
      return currentTime >= hours.start && currentTime < hours.end ? "Open" : "Closed";
    }
    return "Closed"; // If no hours are set for today
  };

  const formatWorkingHours = (workingHours) => {
    return Object.entries(workingHours).map(([day, hours]) => {
      const isToday = new Date().toLocaleString('en-US', { weekday: 'long' }) === day;
      return (
        <tr key={day} className={`border-b border-gray-300 ${isToday ? 'font-bold bg-gray-100' : ''}`}>
          <td className="px-1 py-2">{day}:</td>
          <td className="px-4 py-2">{hours.start} - {hours.end}</td>
        </tr>
      );
    });
  };

  const generalInfoContent = () => {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="ID" value={branchData._id} />
          <DetailRow label="Branch Name" value={branchData.name} />
          <DetailRow label="Mnemonic" value={branchData.mnemonic} />
          <DetailRow
            label="Status"
            value={
              <span className={isOpen() === 'Open' ? 'text-green-500' : 'text-red-500'}>
                {isOpen()}
              </span>
            }
          />
          <tr>
            <td className="px-1 py-2 font-semibold text-gray-700">Working Hours:</td>
            <td className="px-4 py-2">
              <table className="min-w-full">
                <tbody>
                  {formatWorkingHours(branchData.workingHours)}
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  const locationContent = () => {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="Coordinates" value={`${branchData.location.lat}, ${branchData.location.lng}`} />
        </tbody>
      </table>
    );
  };

  const accountInfoContent = () => {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="Created At" value={new Date(branchData.createdAt).toLocaleDateString()} />
          <DetailRow label="Created By" value={loading ? 'Loading...' : createdBy || 'N/A'} />
          <DetailRow label="Pharmacy" value={loading ? 'Loading...' : pharmacyName || 'N/A'} />
        </tbody>
      </table>
    );
  };

  const tabs = [
    { label: 'General Information', content: generalInfoContent() },
    { label: 'Location', content: locationContent() },
    { label: 'Account Information', content: accountInfoContent() },
  ];

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-hidden">
      <div className="flex items-center mb-2">
        <button
          onClick={handleCancel}
          className="text-white py-1 px-4 rounded mb-2 hover:shadow-lg transition duration-300"
          style={{ backgroundColor: brandColor }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>

        <h2 className="text-2xl font-bold mb-2 ml-10" style={{ color: brandColor }}>Branch Details</h2>
      </div>
      <div className="mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-1 mr-2 rounded transition duration-300 ${activeTab === tab.label
              ? `bg-[${brandColor}] text-white`
              : 'bg-gray-300 text-black hover:bg-gray-400'
              }`}
            onClick={() => setActiveTab(tab.label)}
            style={{
              backgroundColor: activeTab === tab.label ? brandColor : 'lightgray',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {tabs.find(tab => tab.label === activeTab)?.content}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <tr className="border-b border-gray-300">
    <td className="px-1 py-2 font-semibold text-gray-700">{label}:</td>
    <td className="px-4 py-2 text-gray-800 text-left">{value}</td>
  </tr>
);

export default ViewBranchDetail;