import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCaretUp, faCaretDown, faEye, faSearch } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from "../API/pharmacyApi";
import UpdatePharmacyForm from './PharmacyUpdateForm'; 
import ViewPharmacyDetail from './viewPharmacy';
import CreatePharmacy from './createPharmacy'; 
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';

const PharmacyManagement = () => {
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
  const brandColor = localStorage.getItem('brandColor') || '#1E467A'; // Default color
  const [errors, setErrors] = useState({});
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); 

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

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
    const intervalId = setInterval(fetchRecord, 3000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (searchValue) {
      const filtered = searchResults.filter((pharmacy) =>
        pharmacy._id.toLowerCase().includes(searchValue.toLowerCase()) ||
        pharmacy.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        pharmacy.phone.toLowerCase().includes(searchValue.toLowerCase()) ||
        pharmacy.status.toLowerCase().includes(searchValue.toLowerCase()) ||
        pharmacy.mnemonic.toLowerCase().includes(searchValue.toLowerCase())
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

  const exportToCSV = () => {
    return filteredResults.map(pharmacy => ({
      ID: pharmacy._id,
      Name: pharmacy.name,
      Phone: pharmacy.phone,
      Status: pharmacy.status,
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Pharmacy ID", "Pharmacy Name", "Phone Number", "Status", "Created At"];
    const tableRows = [];

    filteredResults.forEach(pharmacy => {
      const pharmacyData = [
        pharmacy._id,
        pharmacy.name,
        pharmacy.phone,
        pharmacy.status,
        pharmacy.createdAt,
      ];
      tableRows.push(pharmacyData);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows });
    doc.save("pharmacy_data.pdf");
  };

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

  return (
    <div className="container p-2">
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
          onCommit={(updatedData) => {
            console.log("Updated Pharmacy Data:", updatedData);
            handleCancelEdit();
          }} 
          handleCancel={handleCancelEdit} 
        />
      ) : isCreating ? (
        <CreatePharmacy 
          pharmacyData={pharmacyData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={(newData) => {
            console.log("Created New Pharmacy Data:", newData);
            handleCancelEdit(); 
          }} 
          handleCancel={() => setIsCreating(false)} 
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between mb-2">
            <div className="relative w-full md:w-2/3 max-w-xs">
              <label htmlFor="search" className="sr-only">Search Pharmacy</label>
              <input
                id="search"
                type="search"
                className="h-10 p-2 border rounded pl-10 w-full"
                placeholder="Search"
                onChange={handleSearchInputChange}
              />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: brandColor }}
              />
            </div>

            <div className="flex mt-2 md:mt-0">
              <CSVLink 
                data={exportToCSV()} 
                filename="pharmacy_data.csv" 
                className="btn ml-2" 
                style={{ backgroundColor: brandColor, color: 'white', padding: '4px 10px', borderRadius: '4px', textDecoration: 'none' }}
              >
                Export to CSV
              </CSVLink>
              <button 
                onClick={exportToPDF} 
                className="btn ml-2" 
                style={{ backgroundColor: brandColor, color: 'white', padding: '4px 10px', borderRadius: '4px' }}
              >
                Export to PDF
              </button>
            </div>
          </div>
          <div className="flex justify-start mb-1">
            <button 
              onClick={handleCreateNewPharmacy}
              className="btn"
              style={{
                backgroundColor: brandColor,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
              }}
            >
              Create New Pharmacy
            </button>
          </div>
          {/* Table Section */}
          <div className="mt-1 overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  {['ID', 'Name', 'Mnemonic', 'Phone No', 'Created At', 'Status'].map((field) => (
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
                {currentItems.map((pharmacy) => (
                  <tr key={pharmacy._id} className="hover:bg-gray-100 transition duration-300">
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">{pharmacy._id}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">{pharmacy.name}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">{pharmacy.mnemonic}</td>
                    <td className="py-3 px-4 border-b border-gray-200 text-sm">{pharmacy.phone}</td>
                    <td className="px-3 py-4 border-b border-gray-200 text-sm">{new Date(pharmacy.createdAt).toLocaleString()}</td>
                    <td className={`py-3 px-4 border-b border-gray-200 text-sm ${pharmacy.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                      {pharmacy.status}
                    </td>
                    <td className="px-2 border-b border-gray-200 text-sm">
                      <button
                        onClick={() => handleEditPharmacyData(pharmacy)}
                        className="hover:text-blue-700 transition duration-200"
                      >
                        <FontAwesomeIcon icon={faPencilAlt} />
                      </button>
                    </td>
                    <td className="px-2 border-b border-gray-200 text-sm">
                      <button
                        onClick={() => handleViewPharmacyData(pharmacy)}
                        className="custom-button transition hover:text-blue-700 duration-200 px-2 py-1 rounded"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-1">
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
                className={`px-4 ${currentPage === index + 1 ? 'bg-gray-600 text-black' : 'bg-gray-100'} rounded-none`}
                style={currentPage === index + 1 ? { backgroundColor: brandColor, color: 'white' } : {}}
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

export default PharmacyManagement;