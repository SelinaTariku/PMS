import React from 'react';

const Modal = ({ 
  isOpen, 
  onClose, 
  message, 
  brandColor, 
  onBack, 
  onConfirm, 
  onCancel 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 bg-red-500 text-white text-2xl font-bold w-12 h-8 flex items-center justify-center hover:bg-red-700 transition"
          aria-label="Close"
          style={{ margin: 0 }} 
        >
          &times; 
        </button>
        <h2 className="text-lg font-bold mb-2" style={{ color: brandColor }}>Notification</h2>
        <p className="text-center mb-4" style={{ color: brandColor }}>{message}</p>
        <div className="flex space-x-2">
          {onConfirm && (
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              OK
            </button>
          )}
          {onBack && (
            <button
              onClick={() => {
                onBack();
                onClose();
              }}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              Back
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => {
                onCancel();
                onClose();
              }}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;