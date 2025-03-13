import React, { useState } from 'react';

const RejectPharmacyModal = ({ pharmacyId, onReject, onCancel }) => {
  const [reason, setReason] = useState('');
  const brandColor = localStorage.getItem('brandColor');

  const handleReject = () => {
    if (reason.trim()) {
      console.log('Reject reason:', reason); 
      onReject(reason); 
      setReason(''); 
      onCancel();
    } else {
      alert('Please provide a reason for rejection.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/4">
        <h2 className="text-xl mb-4" style={{ color: brandColor }}>Please provide a reason for rejection.</h2>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={{ color: brandColor }}
          placeholder="Enter reason for rejection"
          className="border rounded p-2 w-full"
        />
        <div className="flex justify-between mt-4">
          <button
            onClick={onCancel}
            className="py-1 px-4 rounded border"
            style={{ background: brandColor, color: 'white' }}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="text-white py-1 px-4 rounded"
            style={{ backgroundColor: '#e74c3c' }}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectPharmacyModal;