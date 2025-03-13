import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CreateRole from './CreateRole';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDetails, setRoleDetails] = useState({});
  const [rolePermissions, setRolePermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [createdByEmail, setCreatedByEmail] = useState('');
  const [updatedByEmail, setUpdatedByEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false); 
  const brandColor = localStorage.getItem('brandColor') || '#007bff';
  const [isAdmin, setIsAdmin] = useState(false);
  const Userrole = localStorage.getItem('role');

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/role/getRoleById/${Userrole}`);
      const userrole = response.data.name;

      if (userrole === 'Admin') {
        setIsAdmin(true);
        const rolesResponse = await axios.get('http://localhost:5000/role/getAllRoleForAdmin');
        setRoles(rolesResponse.data);
      } else {
        const rolesResponse = await axios.get('http://localhost:5000/role/getAllRoleForManager');
        setRoles(rolesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/role/getRoleById/${Userrole}`);
      const userrole = response.data.name;

      if (userrole === 'Admin') {
        const permissionsResponse = await axios.get('http://localhost:5000/pages/getAllPageForAdmin');
        setPermissions(permissionsResponse.data);
      } else {
        const permissionsResponse = await axios.get('http://localhost:5000/pages/getAllPageForManager');
        setPermissions(permissionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchUserEmail = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/users/getUserById/${userId}`);
      return response.data.email;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return '';
    }
  };

  const handleRoleSelect = async (e) => {
    const selectedId = e.target.value;
    setSelectedRole(selectedId);
    if (selectedId) {
      const selectedRole = roles.find(role => role._id === selectedId);
      setRoleDetails(selectedRole);
      
      const currentPermissions = selectedRole.permissions ? selectedRole.permissions.map(perm => perm.page) : [];
      setRolePermissions(currentPermissions);
      setOriginalPermissions(currentPermissions.slice());

      const createdByEmail = await fetchUserEmail(selectedRole.createdBy);
      const updatedByEmail = await fetchUserEmail(selectedRole.updatedBy);
      setCreatedByEmail(createdByEmail);
      setUpdatedByEmail(updatedByEmail);
    } else {
      setRolePermissions([]);
      setRoleDetails({});
      setCreatedByEmail('');
      setUpdatedByEmail('');
      setOriginalPermissions([]);
    }
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setRolePermissions((prev) => [...prev, value]);
    } else {
      setRolePermissions((prev) => prev.filter((permission) => permission !== value));
    }
  };

  const handleSavePermissions = () => {
    if (!selectedRole) {
      setModalMessage('Please select a role to save permissions.');
      setModalOpen(true);
      return;
    }

    if (JSON.stringify(rolePermissions) === JSON.stringify(originalPermissions)) {
      setModalMessage('No changes detected.');
      setModalOpen(true);
      return;
    }
    
    setConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmModalOpen(false);
    const requestBody = {
      permissions: rolePermissions.map(permission => ({ page: permission })), 
      updatedBy: localStorage.getItem('id'),
    };

    try {
      const response = await axios.put(`http://localhost:5000/role/updateRole/${selectedRole}`, requestBody);
      console.log("Update Response: ", response);
      setModalMessage('Permissions updated successfully.');
      setModalOpen(true);
    } catch (error) {
      console.error('Error updating permissions:', error);
      setModalMessage('Failed to update permissions.');
      setModalOpen(true);
    }
  };

  const handleCreateNewRole = () => {
    setShowCreateRole(true); 
  };

  const handleRoleCreated = () => {
    fetchRoles(); 
    setModalMessage('Role created successfully.');
    setModalOpen(true);
    setShowCreateRole(false); 
  };

  const handleBackToRoleManagement = () => {
    setShowCreateRole(false); 
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    const interval = setInterval(() => {
      fetchRoles();
      fetchPermissions();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const CustomModal = ({ isOpen, onClose, message, title, onConfirm }) => {
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
          <h2 className="text-lg font-bold mb-2" style={{ color: brandColor }}>{title}</h2>
          <p className="text-center mb-4" style={{ color: brandColor }}>{message}</p>
          <div className="flex space-x-2">
            {onConfirm ? (
              <>
                <button
                  onClick={() => {
                    handleConfirmSave(); 
                    onClose();
                  }}
                  className="text-white py-2 px-4 rounded"
                  style={{ backgroundColor: brandColor }}
                >
                  OK
                </button>
                <button
                  onClick={onClose}
                  className="text-white py-2 px-4 rounded"
                  style={{ backgroundColor: brandColor }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="text-white py-2 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container p-4 mx-auto max-w-7xl">
      {showCreateRole ? (
        <>
          <div className="flex items-center mb-4">
            <button
              onClick={handleBackToRoleManagement}
              className="text-white mr-2 px-2 text-2xl"
              style={{ background: brandColor, border: 'none' }}
            >
              ←
            </button>
            <h3 className="text-xl mb-2" style={{ color: brandColor }}>Create New Role</h3>
          </div>
          <CreateRole 
            permissions={permissions} 
            onRoleCreated={handleRoleCreated} 
            brandColor={brandColor} 
          />
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-2" style={{ color: brandColor }}>Role Management</h2>

          <div className="mb-2 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-2 md:mb-0">
              <p className="text-x mr-2 font-semibold" style={{ color: brandColor }}>Select Role</p>
              <select
                value={selectedRole || ''}
                onChange={handleRoleSelect}
                className="border rounded py-1 px-2 w-full md:w-80"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id}>{role.name}</option>
                ))}
              </select>
            </div>
            {isAdmin && (
              <button
                onClick={handleCreateNewRole}
                className="mt-2 md:mt-0 bg-blue-500 text-white px-4 py-1 rounded"
                style={{ backgroundColor: brandColor }}
              >
                Create New Role
              </button>
            )}
          </div>

          {selectedRole && (
            <div className="mb-4 overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Name</th>
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Created By</th>
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Created At</th>
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Updated By</th>
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Updated At</th>
                    <th className="border border-gray-300 px-4 py-1" style={{ color: brandColor }}>Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-1">{roleDetails.name}</td>
                    <td className="border border-gray-300 px-4 py-1">{createdByEmail}</td>
                    <td className="border border-gray-300 px-4 py-1">{new Date(roleDetails.createdAt).toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-1">{updatedByEmail}</td>
                    <td className="border border-gray-300 px-4 py-1">{new Date(roleDetails.updatedAt).toLocaleString()}</td>
                    <td className="border border-gray-300 px-4 py-1">{roleDetails.level}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {selectedRole && (
            <div>
              <h3 className="text-xl mb-2" style={{color: brandColor}}>Permissions:</h3>
              <div className="max-h-40 overflow-y-auto border p-2 mb-4">
                {permissions.map(permission => {
                  const isChecked = rolePermissions.includes(permission._id);
                  return (
                    <div key={permission._id} className="flex items-center py-2">
                      <input
                        type="checkbox"
                        value={permission._id}
                        checked={isChecked}
                        onChange={handlePermissionChange}
                        className="mr-2"
                      />
                      <label className="text-sm">{permission.name}</label>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleSavePermissions}
                className="text-white px-4 py-2 rounded mt-4 w-full md:w-auto"
                style={{ background: brandColor }}
              >
                Save Permissions
              </button>
            </div>
          )}
        </>
      )}

      <CustomModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        message="Are you sure you want to change role permissions?"
        title="Confirmation"
        onConfirm={handleConfirmSave} 
      />

      <CustomModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        title="Notification"
      />
    </div>
  );
};

export default RoleManagement;