import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaSortUp, FaSortDown, FaSpinner, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from "axios";

const BranchDetails = ({ category, goBack, brandColor = "#007bff" }) => {
  // State management
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatorEmails, setCreatorEmails] = useState({});
  const [sortConfig, setSortConfig] = useState({ 
    key: null, 
    direction: 'ascending' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // You can adjust this number
  const pharmacy = localStorage.getItem('pharmacy')
  // Data fetching
  useEffect(() => {
    const fetchBranchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `http://localhost:5000/branches/branchDetailsByPharmacy/${pharmacy}/${category}`
        );
        if (!data) throw new Error("No data found");
        setBranches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBranchData();
  }, [category]);

  // Fetch creator emails
  useEffect(() => {
    const fetchCreatorEmails = async () => {
      const uniqueCreatorIds = [...new Set(branches.map(b => b.createdBy))];
      
      try {
        const emails = {};
        await Promise.all(
          uniqueCreatorIds.map(async (creatorId) => {
            const { data } = await axios.get(
              `http://localhost:5000/users/getUserById/${creatorId}`
            );
            emails[creatorId] = data.email;
          })
        );
        setCreatorEmails(emails);
      } catch (err) {
        console.error("Error fetching creator emails:", err);
      }
    };

    if (branches.length > 0) {
      fetchCreatorEmails();
    }
  }, [branches]);

  // Sorting functionality
  const requestSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  // Sort and paginate data
  const { sortedBranches, totalPages } = useMemo(() => {
    // Create a copy of branches for sorting
    let sortableBranches = [...branches];
    
    // Apply sorting if sortConfig exists
    if (sortConfig.key) {
      sortableBranches.sort((a, b) => {
        // Handle nested properties
        const aValue = sortConfig.key.includes('.') 
          ? sortConfig.key.split('.').reduce((o, i) => o?.[i], a)
          : a[sortConfig.key];
        
        const bValue = sortConfig.key.includes('.') 
          ? sortConfig.key.split('.').reduce((o, i) => o?.[i], b)
          : b[sortConfig.key];

        // Compare values
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    // Calculate pagination values
    const totalPages = Math.ceil(sortableBranches.length / itemsPerPage);
    
    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortableBranches.slice(indexOfFirstItem, indexOfLastItem);
    
    return {
      sortedBranches: currentItems,
      totalPages
    };
  }, [branches, sortConfig, currentPage, itemsPerPage]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === "Open" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' 
      ? <FaSortUp className="ml-1" /> 
      : <FaSortDown className="ml-1" />;
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Calculate page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Adjust if we're near the start or end
    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, branches.length)} of{" "}
          {branches.length} branches
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaChevronLeft />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'font-bold' : 'hover:bg-gray-200'}`}
                style={currentPage === 1 ? { backgroundColor: brandColor, color: 'white' } : {}}
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 py-1">...</span>}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-1 rounded-md ${currentPage === number ? 'font-bold' : 'hover:bg-gray-200'}`}
              style={currentPage === number ? { backgroundColor: brandColor, color: 'white' } : {}}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'font-bold' : 'hover:bg-gray-200'}`}
                style={currentPage === totalPages ? { backgroundColor: brandColor, color: 'white' } : {}}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    );
  };

  // Table columns configuration
  const columns = [
    { key: 'mnemonic', label: 'Mnemonic' },
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'rate.average', label: 'Average Rate' },
    { key: 'rate.count', label: 'Rate Count' },
    { key: 'views', label: 'Views' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg shadow-sm p-4">
      <div className="flex items-center space-x-4 mb-4">
        <button
          onClick={goBack}
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: brandColor }}>
          Details for {category}
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <FaSpinner className="animate-spin" style={{ color: brandColor }} size={24} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : branches.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer"
                      style={{ color: brandColor }}
                      onClick={() => {
                        requestSort(key);
                        setCurrentPage(1); // Reset to first page when sorting
                      }}
                    >
                      <div className="flex items-center">
                        {label}
                        {renderSortIcon(key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedBranches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {branch.mnemonic}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {branch.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {renderStatusBadge(branch.status)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {creatorEmails[branch.createdBy] || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(branch.createdAt)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {branch.rate?.average || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {branch.rate?.count || "N/A"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {branch.views || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No branches available for this category.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDetails;