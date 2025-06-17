import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft } from "react-icons/fa";
import {
  faPlus, faEdit, faTrash,
  faSortUp, faSortDown,
  faArrowLeft, faTimes, faSearch
} from '@fortawesome/free-solid-svg-icons';

// Constants for better maintainability
const API_BASE_URL = 'http://localhost:5000/pages';
const ITEMS_PER_PAGE = 6;

// Custom hook for sorting
const useSortableData = (items, config = { key: 'name', direction: 'ascending' }) => {
  const [sortConfig, setSortConfig] = useState(config);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key]?.toString().toLowerCase() || '';
        const bValue = b[sortConfig.key]?.toString().toLowerCase() || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};

// Modal components for better separation
const ConfirmationModal = ({ isOpen, onClose, message, onConfirm, brandColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <h2 className="text-lg font-bold mb-4" style={{ color: brandColor }}>Notification</h2>
        <p className="text-center mb-6">{message}</p>
        <div className="flex space-x-4 w-full justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded text-white hover:opacity-90 transition"
            style={{ backgroundColor: brandColor }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const ResponseModal = ({ isOpen, onClose, message, brandColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4" style={{ color: brandColor }}>Operation Result</h3>
        <p className="text-center mb-6">{message}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded text-white hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, brandColor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h3 className="text-lg font-semibold text-center mb-4" style={{ color: brandColor }}>
          Confirm Deletion
        </h3>
        <p className="text-center mb-6">Are you sure you want to delete this permission?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-white border rounded hover:bg-gray-100 transition"
            style={{ background: brandColor }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ManagePermission = () => {
  const brandColor = localStorage.getItem('brandColor') || '#007bff';

  // State management
  const [pages, setPages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    description: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    level: ''
  });
  const [currentPageId, setCurrentPageId] = useState('');
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [viewTitle, setViewTitle] = useState('Manage Permissions');
  const [isEditing, setIsEditing] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('name'); // Default search by name

  // Modal state
  const [modal, setModal] = useState({
    show: false,
    type: '', // 'confirm', 'success', 'error', 'delete'
    message: '',
    onConfirm: null
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting
  const { items: sortedPages, requestSort, sortConfig } = useSortableData(pages);

  // Filter pages based on search term and selected field
  const filteredPages = useMemo(() => {
    if (!searchTerm) return sortedPages;

    return sortedPages.filter(page => {
      const fieldValue = page[searchField]?.toString().toLowerCase() || '';
      return fieldValue.includes(searchTerm.toLowerCase());
    });
  }, [sortedPages, searchTerm, searchField]);

  // Pagination calculations
  const paginatedPages = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPages.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPages, currentPage]);

  const totalPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);

  // Fetch pages from API
  const fetchPages = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllPages`);
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
      showModal('error', 'Failed to fetch permissions. Please try again.');
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Modal helper function
  const showModal = (type, message, onConfirm = () => { }) => {
    setModal({
      show: true,
      type,
      message,
      onConfirm
    });
  };

  // Form handling
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Permission name must be at least 3 characters';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const resetForm = () => {
    setFormData({ name: '', level: '', description: '' });
    setErrors({ name: '', level: '' });
    setCurrentPageId('');
    setIsEditing(false);
    setViewTitle('Manage Permissions');
  };

  const handleEdit = (page) => {
    setFormData({
      name: page.name,
      level: page.level,
      description: page.description || ''
    });
    setCurrentPageId(page._id);
    setIsEditing(true);
    setViewTitle('Update Permission');
    setCurrentView('form');
  };

  const handleCreateNew = () => {
    resetForm();
    setViewTitle('Create New Permission');
    setCurrentView('form');
  };

  const handleBackToList = () => {
    resetForm();
    setCurrentView('list');
  };

  // API operations
  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem('id');
      const dataToSubmit = {
        ...formData,
        ...(isEditing ? { updatedBy: userId } : { createdBy: userId })
      };

      const response = isEditing
        ? await axios.put(`${API_BASE_URL}/updatePage/${currentPageId}`, dataToSubmit)
        : await axios.post(`${API_BASE_URL}/createPage`, dataToSubmit);

      fetchPages();
      resetForm();
      showModal('success', response.data.message || 'Operation successful!', () => {
        setCurrentView('list');
      });
    } catch (error) {
      console.error('Error saving permission:', error);
      showModal('error', error.response?.data?.message || 'Error saving the permission.');
    }
  };

  const handleDelete = (pageId) => {
    showModal('delete', 'Are you sure you want to delete this permission?', async () => {
      try {
        await axios.delete(`${API_BASE_URL}/deletePage/${pageId}`);
        fetchPages();
        showModal('success', 'Permission deleted successfully!');
      } catch (error) {
        console.error('Error deleting permission:', error);
        showModal('error', error.response?.data?.message || 'Error deleting the permission.');
      }
    });
  };

  const handleCommit = () => {
    if (validateForm()) {
      showModal('confirm',
        isEditing
          ? 'Are you sure you want to update this permission?'
          : 'Are you sure you want to create this permission?',
        handleSubmit
      );
    }
  };

  // Render functions for better organization
  const renderListHeader = () => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
      <h2 className="text-2xl font-bold" style={{ color: brandColor }}>
        {viewTitle}
      </h2>
      <div className="flex flex-col sm:flex-row gap-0.5 ml-5 pl-5">
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2"
          style={{ borderColor: brandColor, focus: { ringColor: brandColor } }}
        >
          <option value="name">Name</option>
          <option value="description">Description</option>
        </select>

        <div className="relative">
          <input
            type="text"
            placeholder={`Search by ${searchField}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-1 border border-gray-300 rounded w-full focus:outline-none focus:ring-2"
            style={{ borderColor: brandColor, focus: { ringColor: brandColor } }}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-3 text-gray-400"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-1 w-full sm:w-auto">
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center px-4 py-1 rounded text-white hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
        >
          <FontAwesomeIcon icon={faPlus} className="" />
          Create New
        </button>


      </div>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50" style={{ color: brandColor }}>
          <tr>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('name')}
            >
              <div className="flex items-center">
                Name
                {sortConfig.key === 'name' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ml-1"
                  />
                )}
              </div>
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
              onClick={() => requestSort('description')}
            >
              <div className="flex items-center">
                Description
                {sortConfig.key === 'description' && (
                  <FontAwesomeIcon
                    icon={sortConfig.direction === 'ascending' ? faSortUp : faSortDown}
                    className="ml-1"
                  />
                )}
              </div>
            </th>
            <th scope="col" className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedPages.length > 0 ? (
            paginatedPages.map((page) => (
              <tr key={page._id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                  {page.name}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {page.description || '-'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                  {page.level}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(page)}
                      className="text-blue-600 hover:text-blue-900 transition"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(page._id)}
                      className="text-red-600 hover:text-red-900 transition"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                {filteredPages.length === 0 ? 'No permissions found' : 'Loading...'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPages.length)}</span> of{' '}
                <span className="font-medium">{filteredPages.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    { color: brandColor }
                  }
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={
                    { color: brandColor }
                  }
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold" style={{ color: brandColor }}>
          {viewTitle}
        </h2>
        <div className="flex space-x-3">

          <button
            className="p-2 rounded-full shadow hover:opacity-90 transition"
            style={{ backgroundColor: brandColor }}
            onClick={handleBackToList}
            aria-label="Go back"
          >
            <FaArrowLeft className="text-white" />
          </button>
          <button
            type="button"
            onClick={handleCommit}
            className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: brandColor, focusRingColor: brandColor }}
          >
            {isEditing ? 'Update' : 'Create'}
          </button>
        </div>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-m font-medium text-gray-700">
            Permission Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md shadow-sm py-1  text-m focus:ring-2 focus:ring-offset-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
              }`}
            style={{ borderColor: errors.name ? '#ef4444' : brandColor }}
            placeholder="Enter permission name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block  text-m font-medium text-gray-700">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: brandColor }}
            placeholder="Enter description (optional)"
          />
        </div>
      </form>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {currentView === 'list' ? (
        <>
          {renderListHeader()}
          {renderTable()}
        </>
      ) : (
        renderForm()
      )}

      {/* Modals */}
      {modal.type === 'confirm' && (
        <ConfirmationModal
          isOpen={modal.show}
          onClose={() => setModal({ ...modal, show: false })}
          message={modal.message}
          onConfirm={modal.onConfirm}
          brandColor={brandColor}
        />
      )}

      {(modal.type === 'success' || modal.type === 'error') && (
        <ResponseModal
          isOpen={modal.show}
          onClose={() => setModal({ ...modal, show: false })}
          message={modal.message}
          brandColor={brandColor}
        />
      )}

      {modal.type === 'delete' && (
        <DeleteConfirmationModal
          isOpen={modal.show}
          onClose={() => setModal({ ...modal, show: false })}
          onConfirm={modal.onConfirm}
          brandColor={brandColor}
        />
      )}
    </div>
  );
};

export default ManagePermission;