import React, { useEffect, useState, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faPencilAlt, 
  faCaretUp, 
  faCaretDown, 
  faEye, 
  faSearch 
} from "@fortawesome/free-solid-svg-icons";
import branchAPI from "../API/branchAPI"; 
import UpdateBranchForm from './updateBranch'; 
import ViewBranchDetail from './viewBranch';
import CreateBranch from './createBranch'; 
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import Modal from '../Modal'; 

// Constants for better maintainability
const SEARCH_FIELDS = [
  { value: 'name', label: 'Name' },
  { value: 'mnemonic', label: 'Mnemonic' },
  { value: 'status', label: 'Status' },
  { value: 'all', label: 'All Fields' }
];

const TABLE_COLUMNS = [
  { id: 'name', label: 'Name', sortable: true },
  { id: 'mnemonic', label: 'Mnemonic', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'createdAt', label: 'Created At', sortable: true }
];

const BranchManagement = () => {
  // Initial state setup
  const initialBranchData = () => ({
    name: '',
    mnemonic: '',
    status: '',
    workingHours: {
      Monday: { open: '', close: '' },
      Tuesday: { open: '', close: '' },
      Wednesday: { open: '', close: '' },
      Thursday: { open: '', close: '' },
      Friday: { open: '', close: '' },
      Saturday: { open: '', close: '' },
      Sunday: { open: '', close: '' },
    },
    location: {
      lat: 0,
      lng: 0,
    },
    pharmacyId: localStorage.getItem('pharmacy'), 
    createdBy: localStorage.getItem('id'), 
  });

  // State management
  const [state, setState] = useState({
    branchData: initialBranchData(),
    isEditing: false,
    isViewing: false,
    isCreating: false,
    searchResults: [],
    filteredResults: [], 
    loading: true,
    sortField: "name",
    sortDirection: "asc",
    searchValue: '',
    searchField: 'all',
    errors: {},
    currentPage: 1,
    isModalOpen: false,
    modalMessage: ''
  });

  const brandColor = localStorage.getItem('brandColor');
  const itemsPerPage = 5;

  // Destructure state for easier access
  const {
    branchData, isEditing, isViewing, isCreating, 
    searchResults, filteredResults, loading,
    sortField, sortDirection, searchValue, searchField,
    errors, currentPage, isModalOpen, modalMessage
  } = state;

  // Helper function to update state
  const updateState = (newState) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  // Fetch branches with error handling
  const fetchBranches = useCallback(async () => {
    updateState({ loading: true });
    try {
      const pharmacyId = localStorage.getItem('pharmacy');
      const response = await branchAPI.getBranchesByPharmacyId();
      if (Array.isArray(response)) {
        updateState({ 
          searchResults: response,
          filteredResults: response,
          loading: false
        });
      } else {
        console.error("Unexpected response format:", response);
        updateState({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      updateState({ 
        loading: false,
        isModalOpen: true,
        modalMessage: 'Failed to fetch branches. Please try again.'
      });
    }
  }, []);

  // Initial data fetch and polling
  useEffect(() => {
    fetchBranches();
    const intervalId = setInterval(fetchBranches, 500000000);
    return () => clearInterval(intervalId);
  }, [fetchBranches]);

  // Filter results based on search criteria
  useEffect(() => {
    if (searchValue) {
      const filtered = searchResults.filter((branch) => {
        if (searchField === 'all') {
          return (
            branch.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            branch.mnemonic.toLowerCase().includes(searchValue.toLowerCase()) ||
            branch.status.toLowerCase().includes(searchValue.toLowerCase())
          );
        }
        return branch[searchField].toLowerCase().includes(searchValue.toLowerCase());
      });
      updateState({ filteredResults: filtered });
    } else {
      updateState({ filteredResults: searchResults });
    }
  }, [searchValue, searchField, searchResults]);

  // Handle search input changes
  const handleSearchInputChange = (e) => {
    const value = e.target.value.trim();
    updateState({ 
      searchValue: value,
      currentPage: 1 
    });
  };

  // Handle search field selection
  const handleSearchFieldChange = (e) => {
    updateState({
      searchField: e.target.value,
      currentPage: 1
    });
  };

  // Sort functionality
  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    const sortedResults = [...filteredResults].sort((a, b) => {
      if (a[field] < b[field]) return direction === "asc" ? -1 : 1;
      if (a[field] > b[field]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    
    updateState({
      sortField: field,
      sortDirection: direction,
      filteredResults: sortedResults,
      currentPage: 1
    });
  };

  // Format working hours for display
  const formatWorkingHours = (workingHours) => {
    return Object.entries(workingHours)
      .map(([day, hours]) => `${day}: ${hours.open} - ${hours.close}`)
      .join(', ');
  };

  // Branch CRUD operations
  const handleEditBranchData = (branch) => {
    updateState({
      branchData: branch,
      isEditing: true,
      isViewing: false,
      isCreating: false
    });
  };

  const handleViewBranchData = (branch) => {
    updateState({
      branchData: branch,
      isViewing: true,
      isEditing: false,
      isCreating: false
    });
  };

  const handleCancelView = () => {
    updateState({ isViewing: false });
  };

  const handleCancelEdit = () => {
    updateState({ isEditing: false });
  };

  const handleCreateNewBranch = () => {
    updateState({
      branchData: initialBranchData(),
      isCreating: true,
      isEditing: false,
      isViewing: false
    });
  };

  const handleCancelCreate = () => {
    updateState({ isCreating: false });
  };

  // Export functions
  const exportToCSV = () => {
    return filteredResults.map(branch => ({
      Name: branch.name,
      Mnemonic: branch.mnemonic,
      Status: branch.status,
      WorkingHours: formatWorkingHours(branch.workingHours),
      CreatedAt: new Date(branch.createdAt).toLocaleString(),
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[ 'Name', 'Mnemonic', 'Status', 'Created At']],
      body: filteredResults.map(branch => [
        branch._id,
        branch.name,
        branch.mnemonic,
        branch.status,
        new Date(branch.createdAt).toLocaleString(),
      ]),
    });
    doc.save("branch_data.pdf");
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Render loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    );
  }

  // Render different views based on state
  if (isViewing) {
    return (
      <ViewBranchDetail 
        branchData={branchData} 
        brandColor={brandColor} 
        handleCancel={handleCancelView} 
      />
    );
  }

  if (isEditing) {
    return (
      <UpdateBranchForm 
        branchData={branchData} 
        setErrors={(errors) => updateState({ errors })} 
        errors={errors} 
        brandColor={brandColor} 
        onCommit={(updatedData) => {
          console.log("Updated Branch Data:", updatedData);
          handleCancelEdit();
        }} 
        handleCancel={handleCancelEdit} 
      />
    );
  }

  if (isCreating) {
    return (
      <CreateBranch 
        branchData={branchData} 
        setErrors={(errors) => updateState({ errors })} 
        errors={errors} 
        brandColor={brandColor} 
        onCommit={(newData) => {
          console.log("Created New Branch Data:", newData);
          handleCancelCreate();
        }} 
        handleCancel={handleCancelCreate} 
      />
    );
  }

  // Main view
  return (
    <div className="ccontainer max-h-80 min-h-80 mb-10 p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Search and Actions Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
            <div className="relative">
              <select
                value={searchField}
                onChange={handleSearchFieldChange}
                className="py-1 pl-3 pr-8 border rounded-lg appearance-none focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: brandColor,
                  color: brandColor,
                  backgroundColor: 'white'
                }}
              >
                {SEARCH_FIELDS.map((field) => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="relative flex-grow">
              <input
                type="search"
                className="p-1 px-2 py-1 border rounded-lg pl-10 w-full focus:outline-none focus:ring-2"
                style={{ borderColor: brandColor }}
                placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label || 'all fields'}...`}
                value={searchValue}
                onChange={handleSearchInputChange}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: brandColor }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={handleCreateNewBranch}
              className="px-4 py-1 rounded-lg font-medium transition-colors"
              style={{ 
                backgroundColor: brandColor,
                color: 'white',
                minWidth: '180px'
              }}
            >
              Create New Branch
            </button>
            
            <div className="flex gap-2">
              <CSVLink 
                data={exportToCSV()} 
                filename="branch_data.csv" 
                className="px-4 py-1 rounded-lg font-medium transition-colors text-center"
                style={{ 
                  backgroundColor: brandColor,
                  color: 'white',
                  textDecoration: 'none'
                }}
              >
                Export CSV
              </CSVLink>
              
              <button 
                onClick={exportToPDF}
                className="px-4 py-1 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: brandColor,
                  color: 'white'
                }}
              >
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_COLUMNS.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${column.sortable ? 'cursor-pointer' : ''}`}
                    style={{ color: brandColor }}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center">
                      {column.label}
                      {column.sortable && sortField === column.id && (
                        <FontAwesomeIcon 
                          icon={sortDirection === "asc" ? faCaretUp : faCaretDown} 
                          className="ml-1" 
                          style={{ color: brandColor }} 
                        />
                      )}
                    </div>
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {branch.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {branch.mnemonic}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        branch.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {branch.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {new Date(branch.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBranchData(branch)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                        <button
                          onClick={() => handleViewBranchData(branch)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="View"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={TABLE_COLUMNS.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                    No branches found. {searchValue && 'Try a different search term.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredResults.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(indexOfLastItem, filteredResults.length)}
              </span>{' '}
              of <span className="font-medium">{filteredResults.length}</span> results
            </div>
            
            <div className="flex space-x-1">
              <button
                onClick={() => updateState({ currentPage: Math.max(currentPage - 1, 1) })}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => updateState({ currentPage: page })}
                  className={`px-3 py-1 rounded-md ${currentPage === page ? 'text-white' : 'hover:bg-gray-100'}`}
                  style={{ backgroundColor: currentPage === page ? brandColor : 'transparent' }}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => updateState({ currentPage: Math.min(currentPage + 1, totalPages) })}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal for error messages */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => updateState({ isModalOpen: false })}
        title="Error"
        brandColor={brandColor}
      >
        <p className="text-gray-700">{modalMessage}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateState({ isModalOpen: false })}
            className="px-4 py-2 rounded-lg font-medium"
            style={{ 
              backgroundColor: brandColor,
              color: 'white'
            }}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default BranchManagement;