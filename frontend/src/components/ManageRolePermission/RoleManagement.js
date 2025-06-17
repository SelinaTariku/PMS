import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CreateRole from './CreateRole';

const API_BASE_URL = 'http://localhost:5000';
const REFRESH_INTERVAL = 2000;

const CustomModal = ({ 
  isOpen, 
  onClose, 
  message, 
  title, 
  onConfirm, 
  brandColor = '#007bff' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <span className="text-2xl">&times;</span>
        </button>
        
        <h2 className="text-xl font-bold mb-4" style={{ color: brandColor }}>
          {title}
        </h2>
        
        <p className="mb-6 text-gray-700">{message}</p>
        
        <div className="flex justify-end space-x-3">
          {onConfirm && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm || onClose}
            className="px-4 py-2 rounded-md text-white hover:opacity-90 transition"
            style={{ backgroundColor: brandColor }}
          >
            {onConfirm ? 'Confirm' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RoleManagement = () => {
  const brandColor = localStorage.getItem('brandColor') || '#007bff';
  const userId = localStorage.getItem('id');
  const userRole = localStorage.getItem('role');
  
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedRoleDetails, setSelectedRoleDetails] = useState({});
  const [rolePermissions, setRolePermissions] = useState([]);
  const [originalPermissions, setOriginalPermissions] = useState([]);
  const [createdByEmail, setCreatedByEmail] = useState('');
  const [updatedByEmail, setUpdatedByEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [modal, setModal] = useState({
    show: false,
    type: '',
    message: '',
    onConfirm: null
  });
  const [showCreateRole, setShowCreateRole] = useState(false);

  const fetchUserEmail = useCallback(async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/users/getUserById/${userId}`);
      return response.data.email;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return 'Unknown';
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {

      const response = await axios.get('http://localhost:5000/role/getAllRoles');
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  })

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/pages/getAllPages`);
      setPermissions(response.data);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  });

  const loadSelectedRoleDetails = useCallback(async (roleId) => {
    try {
      const role = roles.find(r => r._id === roleId);
      if (!role) return;

      setSelectedRoleDetails(role);
      const currentPermissions = role.permissions?.map(perm => perm.page) || [];
      setRolePermissions(currentPermissions);
      setOriginalPermissions([...currentPermissions]);

      const [creatorEmail, updaterEmail] = await Promise.all([
        fetchUserEmail(role.createdBy),
        fetchUserEmail(role.updatedBy)
      ]);
      
      setCreatedByEmail(creatorEmail);
      setUpdatedByEmail(updaterEmail);
    } catch (error) {
      console.error('Error loading role details:', error);
    }
  }, [roles, fetchUserEmail]);

  const handleRoleSelect = async (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);
    if (roleId) {
      await loadSelectedRoleDetails(roleId);
    } else {
      resetSelectedRole();
    }
  };

  const handlePermissionChange = (permissionId, isChecked) => {
    setRolePermissions(prev => 
      isChecked 
        ? [...prev, permissionId]
        : prev.filter(id => id !== permissionId)
    );
  };

  const handleSavePermissions = () => {
    if (!selectedRoleId) {
      setModal({
        show: true,
        type: 'info',
        message: 'Please select a role to save permissions.',
        onConfirm: null
      });
      return;
    }

    if (JSON.stringify(rolePermissions) === JSON.stringify(originalPermissions)) {
      setModal({
        show: true,
        type: 'info',
        message: 'No changes detected.',
        onConfirm: null
      });
      return;
    }
    
    setModal({
      show: true,
      type: 'confirm',
      message: 'Are you sure you want to change role permissions?',
      onConfirm: confirmSavePermissions
    });
  };

  const confirmSavePermissions = async () => {
    try {
      const requestBody = {
        permissions: rolePermissions.map(page => ({ page })),
        updatedBy: userId
      };

      await axios.put(`${API_BASE_URL}/role/updateRole/${selectedRoleId}`, requestBody);
      await loadSelectedRoleDetails(selectedRoleId);
      
      setModal({
        show: true,
        type: 'info',
        message: 'Permissions updated successfully.',
        onConfirm: null
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      setModal({
        show: true,
        type: 'info',
        message: 'Failed to update permissions.',
        onConfirm: null
      });
    }
  };

  const handleCreateNewRole = () => {
    setShowCreateRole(true);
    resetSelectedRole();
  };

  const handleRoleCreated = () => {
    fetchRoles();
    setModal({
      show: true,
      type: 'info',
      message: 'Role created successfully.',
      onConfirm: null
    });
    setShowCreateRole(false);
  };

  const handleBackToRoleManagement = () => {
    setShowCreateRole(false);
  };

  const resetSelectedRole = () => {
    setSelectedRoleDetails({});
    setRolePermissions([]);
    setOriginalPermissions([]);
    setCreatedByEmail('');
    setUpdatedByEmail('');
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
    const interval = setInterval(() => {
      fetchRoles();
      fetchPermissions();
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRoles, fetchPermissions]);

  const renderRoleDetailsTable = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Name', 'Created By', 'Created At', 'Updated By', 'Updated At', 'Level'].map((header) => (
              <th 
                key={header}
                scope="col" 
                className="px-4 py-1 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: brandColor }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-900">
              {selectedRoleDetails.name}
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-500">
              {createdByEmail}
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-500">
              {new Date(selectedRoleDetails.createdAt).toLocaleString()}
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-500">
              {updatedByEmail}
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-500">
              {new Date(selectedRoleDetails.updatedAt).toLocaleString()}
            </td>
            <td className="px-4 py-1 whitespace-nowrap text-sm text-gray-500">
              {selectedRoleDetails.level}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const renderPermissionsList = () => (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold" style={{ color: brandColor }}>
        Permissions
      </h3>
      
      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {permissions.map(permission => {
            const isChecked = rolePermissions.includes(permission._id);
            return (
              <div key={permission._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`perm-${permission._id}`}
                  checked={isChecked}
                  onChange={(e) => handlePermissionChange(permission._id, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-2"
                  style={{ borderColor: brandColor, focusRingColor: brandColor }}
                />
                <label 
                  htmlFor={`perm-${permission._id}`} 
                  className="ml-2 text-sm text-gray-700"
                >
                  {permission.name}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      
      <button
        onClick={handleSavePermissions}
        className="w-full md:w-auto px-4 py-1 rounded-md text-white hover:opacity-90 transition"
        style={{ backgroundColor: brandColor }}
      >
        Save Permissions
      </button>
    </div>
  );

  const renderRoleSelection = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex items-center w-full md:w-auto">
        <label 
          htmlFor="role-select"
          className="mr-2 text-sm font-medium"
          style={{ color: brandColor }}
        >
          Select Role
        </label>
        <select
          id="role-select"
          value={selectedRoleId || ''}
          onChange={handleRoleSelect}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 py-1 pl-3 pr-10 border"
          style={{ borderColor: brandColor }}
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>
      
      {isAdmin && (
        <button
          onClick={handleCreateNewRole}
          className="px-4 py-1 rounded-md text-white hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
        >
          Create New Role
        </button>
      )}
    </div>
  );

  const renderCreateRoleView = () => (
    <div className="space-y-4">
      <div className="flex items-center">
        <button
          onClick={handleBackToRoleManagement}
          className="mr-2 p-1 rounded-full hover:bg-gray-100 transition"
          aria-label="Back to role management"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            style={{ color: brandColor }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h3 className="text-xl font-semibold" style={{ color: brandColor }}>
          Create New Role
        </h3>
      </div>
      
      <CreateRole 
        permissions={permissions} 
        onRoleCreated={handleRoleCreated} 
        brandColor={brandColor} 
      />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* Only show title when not in create role mode */}
      {!showCreateRole && (
        <h1 className="text-2xl font-bold mb-1" style={{ color: brandColor }}>
          Role Management
        </h1>
      )}
      
      {showCreateRole ? (
        renderCreateRoleView()
      ) : (
        <div className="space-y-3">
          {renderRoleSelection()}
          
          {selectedRoleId && (
            <>
              {renderRoleDetailsTable()}
              {renderPermissionsList()}
            </>
          )}
        </div>
      )}
      
      <CustomModal
        isOpen={modal.show}
        onClose={() => setModal({ ...modal, show: false })}
        message={modal.message}
        title={modal.type === 'confirm' ? 'Confirmation' : 'Notification'}
        onConfirm={modal.onConfirm}
        brandColor={brandColor}
      />
    </div>
  );
};

export default RoleManagement;