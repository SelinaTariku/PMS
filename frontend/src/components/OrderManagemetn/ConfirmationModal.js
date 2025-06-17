import React from 'react';
import { 
  BsCheckCircleFill, 
  BsXCircleFill 
} from 'react-icons/bs';
import { MdPayment } from 'react-icons/md';
import { FaTruck } from 'react-icons/fa';

const ConfirmationModal = ({ 
  showConfirmationModal, 
  closeConfirmationModal, 
  handleOrderAction, 
  selectedOrderId, 
  selectedAction,
  brandColor
}) => {
  if (!showConfirmationModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            {selectedAction === 'accept' ? (
              <BsCheckCircleFill className="h-6 w-6 text-green-600" />
            ) : selectedAction === 'reject' ? (
              <BsXCircleFill className="h-6 w-6 text-red-600" />
            ) : selectedAction === 'complete-payment' ? (
              <MdPayment className="h-6 w-6 text-purple-600" />
            ) : (
              <FaTruck className="h-6 w-6 text-green-600" />
            )}
          </div>
          <h2 className="mt-3 text-lg font-medium text-gray-900">Confirm Action</h2>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              {selectedAction === 'accept' ? 'Are you sure you want to accept this order?' :
              selectedAction === 'reject' ? 'Are you sure you want to reject this order?' :
              selectedAction === 'complete-payment' ? 'Mark this order as paid?' :
              'Mark this order as delivered?'}
            </p>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 flex justify-center space-x-3">
          <button
            onClick={closeConfirmationModal}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            onClick={() => handleOrderAction(selectedOrderId, selectedAction)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedAction === 'accept' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
              selectedAction === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
              selectedAction === 'complete-payment' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
              'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
          >
            {selectedAction === 'accept' ? 'Accept' :
              selectedAction === 'reject' ? 'Reject' :
              selectedAction === 'complete-payment' ? 'Mark Paid' :
              'Mark Delivered'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;