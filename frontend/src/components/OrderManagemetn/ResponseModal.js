import React from 'react';

const ResponseModal = ({ message, onClose, brandColor }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
      <h2 className="text-xl font-bold mb-4">Response</h2>
      <p className="mb-4">{message}</p>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-white font-semibold transition-colors"
          style={{ backgroundColor: brandColor }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default ResponseModal;