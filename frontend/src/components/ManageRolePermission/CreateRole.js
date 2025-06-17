import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateRole = ({ permissions, onRoleCreated, brandColor, onNavigate }) => {
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleLevel, setNewRoleLevel] = useState('Admin');
  const [newRolePermissions, setNewRolePermissions] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const permissionsRef = useRef(null);
  const navigate = useNavigate();

  const handleCreateNewRole = () => {
    setConfirmModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    const requestBody = {
      name: newRoleName,
      permissions: newRolePermissions.map(permission => ({ page: permission })),
      level: newRoleLevel,
      createdBy: localStorage.getItem('id'),
    };

    try {
      const response = await axios.post('http://localhost:5000/role/createRole', requestBody);
      setResponseMessage(response.data.message);
      onRoleCreated();
    } catch (error) {
      console.error('Error creating role:', error);
      setResponseMessage('Failed to create role.');
    } finally {
      setConfirmModalOpen(false);
      setResponseModalOpen(true);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewRoleName('');
    setNewRoleLevel('Admin');
    setNewRolePermissions([]);
  };

  useEffect(() => {
    if (permissionsRef.current) {
      permissionsRef.current.scrollTop = permissionsRef.current.scrollHeight;
    }
  }, [newRolePermissions]);

  const LocalModal = ({ isOpen, onClose, title, message, onConfirm, confirmText, cancelText }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-red-500 text-white text-2xl font-bold w-12 h-8 flex items-center justify-center hover:bg-red-700 transition"
            aria-label="Close"
          >
            &times; 
          </button>
          <h2 className="text-lg font-bold mb-2" style={{ color: brandColor }}>{title}</h2>
          <p className="mb-4">{message}</p>
          <div className="flex space-x-2">
            <button
              onClick={onConfirm}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ResponseModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center relative">
          <button
            onClick={onClose}
            className="absolute top-0 right-0 bg-red-500 text-white text-2xl font-bold w-12 h-8 flex items-center justify-center hover:bg-red-700 transition"
            aria-label="Close"
          >
            &times; 
          </button>
          <h2 className="text-lg font-bold mb-2" style={{ color: brandColor }}>{title}</h2>
          <p className="mb-4">{message}</p>
          <button
            onClick={() => {
              onClose();
              onNavigate(); // Call the navigate function passed from RoleManagement
            }}
            className="text-white py-2 px-4 rounded"
            style={{ backgroundColor: brandColor }}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="">
      <input
        type="text"
        placeholder="Role Name"
        value={newRoleName}
        onChange={(e) => setNewRoleName(e.target.value)}
        className="border rounded p-2 mb-1 w-full"
      />
      <h4 className="text-lg mb-1">Permissions:</h4>
      <div
        ref={permissionsRef}
        className="max-h-40 overflow-y-auto mb-2 border"
        style={{ padding: '8px' }}
      >
        {permissions.map(permission => {
          const isChecked = newRolePermissions.includes(permission._id);
          return (
            <div key={permission._id} className="flex items-center py-2">
              <input
                type="checkbox"
                value={permission._id}
                checked={isChecked}
                onChange={(e) => {
                  if (e.target.checked) {
                    setNewRolePermissions((prev) => [...prev, permission._id]);
                  } else {
                    setNewRolePermissions((prev) => prev.filter((id) => id !== permission._id));
                  }
                }}
                className="mr-2"
              />
              <label className="text-sm">{permission.name}</label>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleCreateNewRole}
          className="text-white px-4 py-1 rounded"
          style={{ background: brandColor }}
        >
          Submit New Role
        </button>
        <button
          onClick={resetForm}
          className="text-white px-4 py-1 rounded"
          style={{ background: brandColor }} 
        >
          Reset Form
        </button>
      </div>

      <LocalModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirmation" 
        message={`Are you sure you want to create the new role?`}
        onConfirm={handleConfirmCreate}
        confirmText="Yes"
        cancelText="No"
      />

      <ResponseModal
        isOpen={responseModalOpen}
        onClose={() => setResponseModalOpen(false)} 
        title="Notification" 
        message={responseMessage}
        onNavigate={() => navigate('/')} // Pass the navigate function to the ResponseModal
      />
    </div>
  );
};

export default CreateRole;