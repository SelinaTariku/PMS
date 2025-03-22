import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faCaretUp, faCaretDown, faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import branchAPI from "../API/branchAPI"; 
import UpdateBranchForm from './updateBranch'; 
import ViewBranchDetail from './viewBranch';
import CreateBranch from './createBranch'; 
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import Modal from '../Modal'; 

const BranchManagement = () => {
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

  const [branchData, setBranchData] = useState(initialBranchData());
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchValue, setSearchValue] = useState('');
  const brandColor = localStorage.getItem('brandColor');
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      setLoading(true); 
      try {
        const pharmacyId = localStorage.getItem('pharmacy');
        const response = await branchAPI.getBranchesByPharmacyId(pharmacyId);
        if (Array.isArray(response)) {
          setSearchResults(response);
          setFilteredResults(response); 
        } else {
          console.error("Unexpected response format:", response);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
    const intervalId = setInterval(fetchBranches, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = searchResults.filter((branch) =>
        branch.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        branch.mnemonic.toLowerCase().includes(searchValue.toLowerCase()) ||
        branch.status.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredResults(filtered);
    } else {
      setFilteredResults(searchResults);
    }
  }, [searchValue, searchResults]);

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value.trim());
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
    const sortedResults = [...filteredResults].sort((a, b) => {
      if (direction === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setFilteredResults(sortedResults);
    setCurrentPage(1);
  };

  const formatWorkingHours = (workingHours) => {
    return Object.entries(workingHours).map(([day, hours]) => {
      return `${day}: ${hours.open} - ${hours.close}`;
    }).join(', ');
  };

  const handleEditBranchData = (branch) => {
    setBranchData(branch);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false); 
  };

  const handleViewBranchData = (branch) => {
    setBranchData(branch);
    setIsViewing(true);
    setIsEditing(false);
    setIsCreating(false); 
  };

  const handleCancelView = () => {
    setIsViewing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCreateNewBranch = () => {
    setBranchData(initialBranchData()); 
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
  };

  const exportToCSV = () => {
    return filteredResults.map(branch => ({
      ID: branch._id,
      Name: branch.name,
      Mnemonic: branch.mnemonic,
      Status: branch.status,
      WorkingHours: JSON.stringify(branch.workingHours),
      CreatedAt: new Date(branch.createdAt).toLocaleString(),
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [['ID', 'Name', 'Mnemonic', 'Status', 'Created At']],
      body: filteredResults.map(branch => [
        branch._id,
        branch.name,
        branch.mnemonic,
        branch.status,
        formatWorkingHours(branch.workingHours),
        new Date(branch.createdAt).toLocaleString(),
      ]),
    });
    doc.save("branch_data.pdf");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (filteredResults || []).slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  return (
    <div className="container p-2">
      {isViewing ? (
        <ViewBranchDetail 
          branchData={branchData} 
          brandColor={brandColor} 
          handleCancel={handleCancelView} 
        />
      ) : isEditing ? (
        <UpdateBranchForm 
          branchData={branchData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={(updatedData) => {
            console.log("Updated Branch Data:", updatedData);
            handleCancelEdit();
          }} 
          handleCancel={handleCancelEdit} 
        />
      ) : isCreating ? (
        <CreateBranch 
          branchData={branchData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={(newData) => {
            console.log("Created New Branch Data:", newData);
            handleCancelEdit(); 
          }} 
          handleCancel={() => setIsCreating(false)} 
        />
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <div className="relative w-2/3 max-w-xs">
              <label htmlFor="search" className="sr-only">Search Branch</label>
              <input
                id="search"
                type="search"
                className="h-8 p-2 border rounded pl-10 w-full"
                placeholder="Search"
                onChange={handleSearchInputChange}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: brandColor }}
              />
            </div>

            <div>
              <CSVLink data={exportToCSV()} filename="branch_data.csv" className="btn ml-2" style={{ backgroundColor: brandColor, color: 'white', padding: '5px 10px', borderRadius: '4px', textDecoration: 'none' }}>
                Export to CSV
              </CSVLink>
              <button onClick={exportToPDF} className="btn ml-2" style={{ backgroundColor: brandColor, color: 'white', padding: '4px 10px', borderRadius: '4px' }}>
                Export to PDF
              </button>
            </div>
          </div>

          <div className="flex justify-start mb-1">
            <button 
              onClick={handleCreateNewBranch}
              className="btn"
              style={{
                backgroundColor: brandColor,
                color: 'white',
                padding: '5px 10px',
                borderRadius: '4px',
              }}>
              Create New Branch
            </button>
          </div>

          {/* Table Section */}
          <div className="mt-1 overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  {['ID', 'Name', 'Mnemonic', 'Status', 'Created At'].map((field) => (
                    <th
                      key={field}
                      onClick={() => handleSort(field)}
                      className="cursor-pointer px-4 py-1 text-left text-sm font-semibold text-gray-600"
                      style={{ color: brandColor }}
                    >
                      {field.charAt(0).toUpperCase() + field.slice(1).replace('.', ' ')}
                      {sortField === field && (
                        <FontAwesomeIcon icon={sortDirection === "asc" ? faCaretUp : faCaretDown} className="ml-1" style={{ color: brandColor }} />
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-1 text-left text-sm font-semibold text-gray-600">Edit</th>
                  <th className="px-4 py-1 text-left text-sm font-semibold text-gray-600">View</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((branch) => (
                    <tr key={branch._id} className="hover:bg-gray-100 transition duration-300">
                      <td className="py-1 px-4 border-b border-gray-200 text-sm">{branch._id}</td>
                      <td className="py-1 px-4 border-b border-gray-200 text-sm">{branch.name}</td>
                      <td className="py-1 px-4 border-b border-gray-200 text-sm">{branch.mnemonic}</td>
                      <td className={`py-1 px-4 border-b border-gray-200 text-sm ${branch.status === 'Open' ? 'text-green-500' : 'text-red-500'}`}>
                        {branch.status}
                      </td>
                      <td className="py-1 px-4 border-b border-gray-200 text-sm">{new Date(branch.createdAt).toLocaleString()}</td>
                      <td className="px-1 py-1 border-b border-gray-200 text-sm">
                        <button
                          onClick={() => handleEditBranchData(branch)}
                          className="hover:text-blue-700 transition duration-200"
                        >
                          <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                      </td>
                      <td className="px-1 py-1 border-b border-gray-200 text-sm">
                        <button
                          onClick={() => handleViewBranchData(branch)}
                          className="custom-button transition hover:text-blue-700 duration-200 px-2 py-1 rounded"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-2">No branches found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 rounded-l-lg"
              style={{ background: brandColor, color: "white" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 ${currentPage === index + 1 ? 'bg-gray-600 text-white' : 'bg-gray-100'} rounded-none`}
                style={currentPage === index + 1 ? { backgroundColor: brandColor } : {}}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 rounded-r-lg"
              style={{ background: brandColor, color: "white" }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BranchManagement;