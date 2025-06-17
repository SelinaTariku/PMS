import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft } from "react-icons/fa";

const ViewPharmacyDetail = ({ pharmacyData, brandColor, handleCancel }) => {
  const [activeTab, setActiveTab] = useState('General Information');

  const tabs = [
    { label: 'General Information', content: generalInfoContent() },
    { label: 'License Information', content: licenseInfoContent() },
    { label: 'Address', content: addressContent() },
    { label: 'Feedback', content: feedbackContent() },
  ];

  function generalInfoContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="ID" value={pharmacyData._id} />
          <DetailRow label="Name" value={pharmacyData.name} />
          <DetailRow label="Logo" value={<img src={pharmacyData.logo} alt="Logo" className="h-16" />} />
          <DetailRow label="Brand Color" value={<span style={{ backgroundColor: pharmacyData.brandColor }} className="inline-block w-4 h-4 rounded-full"></span>} />
          <DetailRow
            label="Status"
            value={
              <span className={pharmacyData.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                {pharmacyData.status}
              </span>
            }
          />
        </tbody>
      </table>
    );
  }

  function licenseInfoContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="License Number" value={pharmacyData.licenseNumber} />
          <DetailRow label="License Expiration" value={new Date(pharmacyData.licenseExpirationDate).toLocaleDateString()} />
          <DetailRow
            label="License Document"
            value={pharmacyData.licenceDocument ?
              <a href={pharmacyData.licenceDocument} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View License Document</a>
              : 'No document available'}
          />
        </tbody>
      </table>
    );
  }

  function addressContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="Address" value={`${pharmacyData.street}, ${pharmacyData.city}, ${pharmacyData.state}`} />
          <DetailRow label="Phone" value={pharmacyData.phone} />
          <DetailRow label="Email" value={pharmacyData.email} />
        </tbody>
      </table>
    );
  }

  function feedbackContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          {pharmacyData.feedback.length > 0
            ? pharmacyData.feedback.map(f => <DetailRow key={f.user} label={f.user} value={`${f.comment} (Rating: ${f.rating})`} />)
            : <tr><td colSpan="2" className="text-black text-center">No feedback available</td></tr>
          }
        </tbody>
      </table>
    );
  }

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-hidden">

      <div className="flex items-center mb-2">
        <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={handleCancel}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>
        <h2 className="text-2xl font-bold mb-2 ml-10" style={{ color: brandColor }}>Pharmacy Details</h2>
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

export default ViewPharmacyDetail;