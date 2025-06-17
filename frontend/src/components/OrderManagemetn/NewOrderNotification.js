import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { IoMdNotifications } from 'react-icons/io';

const NewOrderNotification = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl border-l-4 border-blue-500 flex items-center animate-bounce">
        <IoMdNotifications className="text-blue-500 text-xl mr-2" />
        <span className="font-medium">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default NewOrderNotification;