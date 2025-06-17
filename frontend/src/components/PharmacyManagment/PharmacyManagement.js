import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCaretUp, faCaretDown, faEye, faSearch, faFileExport, faPlus } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from "../API/pharmacyApi";
import UpdatePharmacyForm from './PharmacyUpdateForm'; 
import ViewPharmacyDetail from './viewPharmacy';
import CreatePharmacy from './createPharmacy'; 
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';

const PharmacyManagement = () => {
  // Initial state setup
  const initialPharmacyData = () => ({
    name: '',
    logo: '',
    brandColor: '#000000',
    street: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenceDocument: '',
    licenseExpirationDate: '',
    status: 'Pending',
    authorizedBy: '',
    mnemonic: '',
    CURR: 0,
    noOfBranch: 1,
  });

  // State management
  const [pharmacyData, setPharmacyData] = useState(initialPharmacyData());
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchValue, setSearchValue] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState('name');
  const brandColor = localStorage.getItem('brandColor') || '#1E467A';
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Searchable fields configuration
  const searchFields = [
    { value: 'name', label: 'Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'status', label: 'Status' },
    { value: 'mnemonic', label: 'Mnemonic' },
    { value: 'email', label: 'Email' }
  ];

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Data fetching
  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await PharmacyAPI.fetchAllLive();
        setSearchResults(data || []);
        setFilteredResults(data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, []);

  // Search and filter logic
  useEffect(() => {
    if (searchValue) {
      const filtered = searchResults.filter((pharmacy) => {
        const fieldValue = pharmacy[selectedSearchField]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchValue.toLowerCase());
      });
      setFilteredResults(filtered);
    } else {
      setFilteredResults(searchResults);
    }
  }, [searchValue, searchResults, selectedSearchField]);

  // Handlers
  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchFieldChange = (e) => {
    setSelectedSearchField(e.target.value);
    setSearchValue('');
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

  // Export functions
  const exportToCSV = () => {
    return filteredResults.map(pharmacy => ({
      ID: pharmacy._id,
      Name: pharmacy.name,
      Phone: pharmacy.phone,
      Status: pharmacy.status,
      Email: pharmacy.email,
      'Created At': new Date(pharmacy.createdAt).toLocaleString(),
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Pharmacy Management Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    
    const tableColumn = ["ID", "Name", "Phone", "Status", "Email", "Created At"];
    const tableRows = filteredResults.map(pharmacy => [
      pharmacy._id,
      pharmacy.name,
      pharmacy.phone,
      pharmacy.status,
      pharmacy.email,
      new Date(pharmacy.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        halign: 'left',
      },
      headStyles: {
        fillColor: [brandColor],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 30 }
    });
    
    doc.save("pharmacy_report.pdf");
  };

  // Pharmacy actions
  const handleEditPharmacyData = (pharmacy) => {
    setPharmacyData(pharmacy);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
  };

  const handleViewPharmacyData = (pharmacy) => {
    setPharmacyData(pharmacy);
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

  const handleCreateNewPharmacy = () => {
    setPharmacyData(initialPharmacyData());
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-6">
      {isViewing ? (
        <ViewPharmacyDetail 
          pharmacyData={pharmacyData} 
          brandColor={brandColor} 
          handleCancel={handleCancelView} 
        />
      ) : isEditing ? (
        <UpdatePharmacyForm 
          pharmacyData={pharmacyData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={handleCancelEdit} 
          handleCancel={handleCancelEdit} 
        />
      ) : isCreating ? (
        <CreatePharmacy 
          pharmacyData={pharmacyData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={() => setIsCreating(false)} 
          handleCancel={() => setIsCreating(false)} 
        />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold " style={{color:brandColor}}>Pharmacy Management</h1>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Enhanced Search Section */}
              <div className="relative flex-grow md:w-64">
                <div className="flex rounded-md shadow-sm">
                  <select
                    value={selectedSearchField}
                    onChange={handleSearchFieldChange}
                    className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                  >
                    {searchFields.map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                  <div className="relative flex-grow">
                    <input
                      type="search"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Search by ${searchFields.find(f => f.value === selectedSearchField)?.label || 'field'}...`}
                      value={searchValue}
                      onChange={handleSearchInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewPharmacy}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: brandColor }}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  New Pharmacy
                </button>
                
                <div className="relative group">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                    <div className="py-1">
                      <CSVLink 
                        data={exportToCSV()} 
                        filename="pharmacy_data.csv" 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export to CSV
                      </CSVLink>
                      <button
                        onClick={exportToPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export to PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Mnemonic', 'Phone', 'Email', 'Status', 'Created At'].map((field) => (
                      <th
                        key={field}
                        onClick={() => handleSort(field.toLowerCase().replace(' ', ''))}
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ color: brandColor }}
                      >
                        <div className="flex items-center">
                          {field}
                          {sortField === field.toLowerCase().replace(' ', '') && (
                            <FontAwesomeIcon 
                              icon={sortDirection === "asc" ? faCaretUp : faCaretDown} 
                              className="ml-1" 
                              style={{ color: brandColor }} 
                            />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((pharmacy) => (
                      <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pharmacy.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.mnemonic}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.phone}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${pharmacy.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              pharmacy.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {pharmacy.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(pharmacy.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEditPharmacyData(pharmacy)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button
                              onClick={() => handleViewPharmacyData(pharmacy)}
                              className="text-indigo-600 hover:text-indigo-900"
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
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No pharmacies found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResults.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredResults.length)}</span> of{' '}
                      <span className="font-medium">{filteredResults.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Previous</span>
                        Previous
                      </button>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 : 
                                        currentPage >= totalPages - 2 ? totalPages - 4 + i : 
                                        currentPage - 2 + i;
                        if (pageNum > totalPages || pageNum < 1) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-1 border text-sm font-medium ${currentPage === pageNum ? 
                              `z-10 bg-blue-50 border-blue-500 text-blue-600` : 
                              'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Next</span>
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PharmacyManagement;