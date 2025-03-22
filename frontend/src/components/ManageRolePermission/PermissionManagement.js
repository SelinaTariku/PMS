import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faSortUp, faSortDown, faArrowLeft, faTimes } from '@fortawesome/free-solid-svg-icons';

const ManagePermission = () => {
  const [pages, setPages] = useState([]);
  const [formData, setFormData] = useState({ name: '', level: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentPageId, setCurrentPageId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [deletionMessage, setDeletionMessage] = useState(''); 
  const [showDeletionModal, setShowDeletionModal] = useState(false); 
  const [errors, setErrors] = useState({ name: '', level: '' });
  const [title, setTitle] = useState('Manage Permissions');
  const [modalType, setModalType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); 

  const brandColor = localStorage.getItem('brandColor') || '#007bff';

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/pages/getAllPages');
      setPages(response.data);
    } catch (error) {
      console.error('Error fetching pages:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { name: '', level: '' };

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Invalid Permission Name';
      valid = false;
    }

    if (!formData.level) {
      newErrors.level = 'Please select a level.';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCommit = () => {
    if (validateForm()) {
      setConfirmationMessage(isEditing ? 'Are you sure you want to update this permission?' : 'Are you sure you want to create this permission?');
      setModalType('commit');
      setShowConfirmationModal(true);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem('id');
      const dataToSubmit = {
        ...formData,
        ...(isEditing ? { updatedBy: userId } : { createdBy: userId })
      };

      let response;
      if (isEditing) {
        response = await axios.put(`http://localhost:5000/pages/updatePage/${currentPageId}`, dataToSubmit);
      } else {
        response = await axios.post('http://localhost:5000/pages/createPage', dataToSubmit);
      }

      fetchPages();
      resetForm();
      setConfirmationMessage(response.data.message || 'Success!');
      setModalType('success');
      setShowConfirmationModal(true);
    } catch (error) {
      console.error('Error saving page:', error);
      setConfirmationMessage(error.response?.data?.message || 'Error saving the permission.');
      setModalType('error');
      setShowConfirmationModal(true);
    }
  };

  const handleEdit = (page) => {
    setFormData({ name: page.name, level: page.level, description: page.description });
    setIsEditing(true);
    setCurrentPageId(page._id);
    setShowForm(true);
    setTitle('Update Permissions');
  };

  const handleDelete = (pageId) => {
    setShowConfirmDelete(true);
    setPageToDelete(pageId);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/pages/deletePage/${pageToDelete}`);
      setDeletionMessage('Permission deleted successfully!'); 
      fetchPages();
      setShowConfirmDelete(false);
      setShowDeletionModal(true); 
    } catch (error) {
      console.error('Error deleting page:', error);
      setDeletionMessage('Error deleting the permission.'); 
      setShowDeletionModal(true); 
    }
  };

  const resetForm = () => {
    setFormData({ name: '', level: '', description: '' });
    setIsEditing(false);
    setCurrentPageId('');
    setErrors({ name: '', level: '' });
    setTitle('Manage Permissions');
  };

  const clearForm = () => {
    setFormData({ name: '', level: '', description: '' });
    setErrors({ name: '', level: '' });
  };

  const filteredPages = pages.filter(page =>
    (page.name && page.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (page.description && page.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedPages = filteredPages.sort((a, b) => {
    const aValue = a[sortConfig.key] ? a[sortConfig.key].toLowerCase() : '';
    const bValue = b[sortConfig.key] ? b[sortConfig.key].toLowerCase() : '';

    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastPage = currentPage * itemsPerPage;
  const indexOfFirstPage = indexOfLastPage - itemsPerPage;
  const currentPages = sortedPages.slice(indexOfFirstPage, indexOfLastPage);
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(filteredPages.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Modal for confirmation messages
  const Modal = ({ isOpen, onClose, message, onConfirm }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-sm w-full flex flex-col items-center">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-600"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <h2 className="text-lg font-bold mb-2" style={{ color: brandColor }}>Notification</h2>
          <p className="text-center mb-4" style={{ color: brandColor }}>{message}</p>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                onConfirm();
                setShowForm(false); 
                onClose();
              }}
              className="text-white py-2 px-4 rounded"
              style={{ backgroundColor: brandColor }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeletionResponseModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-2 " style={{color:brandColor}}>Deletion Response</h3>
          <p className="text-center mb-4" >{message}</p>
          <button
            onClick={onClose}
            className="text-white py-2 px-4 rounded"
            style={{ backgroundColor: brandColor }}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-2 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-1" style={{ color: brandColor }}>
        {title}
      </h2>
      
      {!showForm ? (
        <>
          <button
            onClick={() => {
              setShowForm(true);
              setTitle('Create New Permissions');
            }}
            className="mb-2 w-60 text-white px-2 py-1 rounded transition"
            style={{ background: brandColor }}
          >
            <FontAwesomeIcon icon={faPlus} /> Create New Permission
          </button>

          <input
            type="text"
            placeholder="Search Permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-60 px-2 py-1 ml-10 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 mb-2"
          />

          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left">
              <thead style={{ color: brandColor }}>
                <tr>
                  <th className="px-2 py-2 cursor-pointer" onClick={() => requestSort('name')}>
                    Name {sortConfig.key === 'name' && (sortConfig.direction === 'ascending' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />)}
                  </th>
                  <th className="px-2 py-2 cursor-pointer" onClick={() => requestSort('description')}>
                    Description {sortConfig.key === 'description' && (sortConfig.direction === 'ascending' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />)}
                  </th>
                  <th className="px-2 py-2 cursor-pointer" onClick={() => requestSort('level')}>
                    Level {sortConfig.key === 'level' && (sortConfig.direction === 'ascending' ? <FontAwesomeIcon icon={faSortUp} /> : <FontAwesomeIcon icon={faSortDown} />)}
                  </th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentPages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-100">
                    <td className="px-2 py-2 text-sm">{page.name}</td>
                    <td className="px-2 py-2 text-sm">{page.description}</td>
                    <td className="px-2 py-2 text-sm">{page.level}</td>
                    <td className="px-2 py-2 text-sm flex space-x-2">
                      <button onClick={() => handleEdit(page)} style={{color:brandColor}} className=" text-white px-4 rounded transition">
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button onClick={() => handleDelete(page._id)} style={{color:brandColor}} className=" text-white px-4 rounded transition">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4">
            {pageNumbers.map(number => (
              <button
                key={number}
                onClick={() => setCurrentPage(number)}
                className={`mx-1 px-2 py-1 rounded ${currentPage === number ? 'bg-blue-900 text-white' : 'bg-gray-200 text-black'}`}
              >
                {number}
              </button>
            ))}
          </div>
        </>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleCommit(); }} className="mb-4">
          <div className="flex mb-4 mt-2">
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }} className="text-white px-4 py-1 rounded" style={{ background: brandColor }}>
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
              Back
            </button>
            <button type="button" onClick={clearForm} className="text-white px-4 pl-3 py-1 ml-2 rounded" style={{ background: brandColor }}>
              Cancel
            </button>
            <button type="button" onClick={handleCommit} style={{ background: brandColor }} className="text-white pl-5 ml-2 px-4 py-1 rounded hover:bg-blue-700 transition">
              Commit
            </button>
          </div>
          <div className="flex items-center mb-2">
            <label className="block mb-1">
              Page Name <span className="text-red-500">*</span>
            </label>
            {errors.name && <span className="text-red-500 text-sm ml-2">{errors.name}</span>}
          </div>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Page Name"
            required
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
          <div className="flex items-center mb-2">
            <label className="block mb-1">
              Level <span className="text-red-500">*</span>
            </label>
            {errors.level && <span className="text-red-500 text-sm ml-2">{errors.level}</span>}
          </div>
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded mb-2"
          >
            <option value="" disabled>Select Level</option>
            <option value="Admin">Admin</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="All">All</option>
          </select>
          <label className="block mb-1">Description (optional)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border border-gray-300 rounded mb-2"
          />
        </form>
      )}

      {showConfirmationModal && (
        <Modal 
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          message={confirmationMessage}
          onConfirm={() => {
            if (modalType === 'commit') {
              handleSubmit(); 
            }
            if (modalType === 'success') {
              setShowForm(false); 
            }
            setShowConfirmationModal(false); 
          }}
        />
      )}

      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h3 className="text-lg font-semibold text-center" style={{ color: brandColor }}>Confirm Deletion</h3>
            <p className="text-center" style={{ color: brandColor }}>Are you sure you want to delete this permission?</p>
            <div className="flex justify-center mt-4">
              <button onClick={() => setShowConfirmDelete(false)} style={{ background: brandColor }} className="text-white p-2 rounded mr-2">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-600 text-white p-2 rounded">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showDeletionModal && ( 
        <DeletionResponseModal
          isOpen={showDeletionModal}
          onClose={() => setShowDeletionModal(false)}
          message={deletionMessage}
        />
      )}
    </div>
  );
};



export default ManagePermission;