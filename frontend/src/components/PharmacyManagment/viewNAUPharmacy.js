import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from '../API/pharmacyApi';
import RejectPharmacyModal from './RejectPharmacyModal';
import Modal from '../Modal'; // Import the Modal component

const ViewPharmacyDetail = ({ pharmacyData, handleCancel, onReject }) => {
  const [activeTab, setActiveTab] = useState('General Information');
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [notification, setNotification] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [authorizationInfo, setAuthorizationInfo] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // New state for confirmation modal
  const brandColor = localStorage.getItem('brandColor');

  const tabs = [
    { label: 'General Information', content: generalInfoContent() },
    { label: 'License Information', content: licenseInfoContent() },
    { label: 'Address', content: addressContent() },
  ];

  function generalInfoContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="Name" value={pharmacyData.name} />
          <DetailRow
            label="Logo"
            value={
              pharmacyData.logo ? (
                <img
                  src={pharmacyData.logo}
                  alt="Logo Preview"
                  className="w-20 h-10 object-contain border border-gray-300 rounded"
                  onError={(e) => {
                    e.target.src = '/path/to/default/logo.png'; 
                  }}
                />
              ) : (
                'No logo available'
              )
            }
          />
          <DetailRow
            label="Brand Color"
            value={
              <span
                style={{ backgroundColor: pharmacyData.brandColor }}
                className="inline-block w-4 h-4 rounded-full"
              ></span>
            }
          />
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
          <DetailRow
            label="License Expiration"
            value={new Date(pharmacyData.licenseExpirationDate).toLocaleDateString()}
          />
          <DetailRow
            label="License Document"
            value={
              pharmacyData.licenceDocument ? (
                <a
                  href={pharmacyData.licenceDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View License Document
                </a>
              ) : (
                'No document available'
              )
            }
          />
        </tbody>
      </table>
    );
  }

  function addressContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow
            label="Address"
            value={`${pharmacyData.street}, ${pharmacyData.city}, ${pharmacyData.state}`}
          />
          <DetailRow label="Phone" value={pharmacyData.phone} />
          <DetailRow label="Email" value={pharmacyData.email} />
        </tbody>
      </table>
    );
  }

  const handleAuthorize = () => {
    setIsConfirmationModalOpen(true); // Show confirmation modal
  };

  const handleConfirmAuthorize = async () => {
    setIsConfirmationModalOpen(false); // Close confirmation modal
    setIsAuthorizing(true);
    setNotification('');
    setAuthorizationInfo(null);

    try {
      const response = await PharmacyAPI.authorize(pharmacyData._id.toString());
      console.log('Authorization Response:', response);
      setAuthorizationInfo(response);
      setNotification(response.message || 'Pharmacy authorized successfully!'); // Set success message
      handleCancel(); // Close the detail view
    } catch (error) {
      console.error(error);
      setNotification(error.message || 'An error occurred while authorizing the pharmacy.');
    } finally {
      setIsAuthorizing(false);
      setIsModalOpen(true); // Open the notification modal
    }
  };

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-hidden">
      <div className="flex items-center mb-2">
        <button
          onClick={handleCancel}
          className="text-white p-2 rounded mb-1 hover:shadow-lg transition duration-300"
          style={{ backgroundColor: brandColor }}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <h2 className="text-2xl font-bold ml-2" style={{ color: brandColor }}>
          Pharmacy Details
        </h2>
      </div>

      <div className="mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-1 mr-2 rounded transition duration-300 ${
              activeTab === tab.label
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

      <div>{tabs.find((tab) => tab.label === activeTab)?.content}</div>

      <div className="mt-4">
        <button
          onClick={handleAuthorize}
          className="text-white py-1 px-4 rounded hover:bg-blue-600 transition duration-300"
          style={{
            backgroundColor: brandColor,
          }}
          disabled={isAuthorizing}
        >
          {isAuthorizing ? 'Authorizing...' : 'Authorize'}
        </button>

        <button
          onClick={() => setIsRejecting(true)}
          className="text-white py-1 px-4 rounded hover:bg-red-600 transition duration-300 ml-2"
          style={{
            backgroundColor: '#e74c3c',
          }}
        >
          Reject
        </button>
      </div>

      {/* Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/4">
            <h2 className="text-xl mb-4" style={{ color: brandColor }}>
              {notification || (authorizationInfo ? authorizationInfo.message : 'Authorization Complete')}
            </h2>
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <Modal
          isOpen={isConfirmationModalOpen}
          onClose={() => setIsConfirmationModalOpen(false)}
          message="Are you sure you want to authorize this pharmacy?"
          brandColor={brandColor}
          onConfirm={handleConfirmAuthorize}
          onCancel={() => setIsConfirmationModalOpen(false)}
        />
      )}

      {isRejecting && (
        <RejectPharmacyModal
          pharmacyId={pharmacyData._id.toString()}
          onReject={onReject}
          onCancel={() => setIsRejecting(false)}
        />
      )}
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