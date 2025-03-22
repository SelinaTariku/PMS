import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSearch, faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import PharmacyAPI from "../API/pharmacyApi";
import ViewPharmacyDetail from "./viewNAUPharmacy";
import RejectPharmacyModal from "./RejectPharmacyModal";

const AuthorisePharmacy = () => {
  const [pharmacyId, setPharmacyId] = useState("");
  const [pharmacyData, setPharmacyData] = useState({
    name: '',
    logo: '',
    brandColor: '#000000',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
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

  const brandColor = localStorage.getItem('brandColor') || '#1E467A';
  const [isViewing, setIsViewing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [allRecord, setAllRecord] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [notification, setNotification] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchRecord = async () => {
    setLoading(true);
    try {
      const data = await PharmacyAPI.fetchAllNAU();
      setAllRecord(data || []);
      // Only set search results if there's no search input
      if (!pharmacyId.trim()) {
        setSearchResults(data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
    const intervalId = setInterval(fetchRecord, 5000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!pharmacyId.trim()) {
      setSearchResults(allRecord);
    }
  }, [allRecord, pharmacyId]);

  const handleSearchInputChange = (e) => {
    const inputValue = e.target.value.toLowerCase();
    setPharmacyId(inputValue);

    if (inputValue.trim()) {
      const filteredResults = allRecord.filter((pharmacy) => {
        return (
          pharmacy._id.toLowerCase().includes(inputValue) ||
          pharmacy.name.toLowerCase().includes(inputValue) ||
          pharmacy.phone.toLowerCase().includes(inputValue) ||
          pharmacy.email.toLowerCase().includes(inputValue) ||
          pharmacy.street.toLowerCase().includes(inputValue) ||
          pharmacy.city.toLowerCase().includes(inputValue) ||
          pharmacy.state.toLowerCase().includes(inputValue) ||
          pharmacy.status.toLowerCase().includes(inputValue) ||
          pharmacy.createdAt.toLowerCase().includes(inputValue)
        );
      });
      setSearchResults(filteredResults);
    } else {
      setSearchResults(allRecord);
    }
  };

  const handleReject = async (reason) => {
    setIsRejecting(false); // Close the modal

    if (!pharmacyData._id) {
      console.error("Pharmacy ID is missing for rejection");
      setNotification("Pharmacy ID is missing");
      return;
    }

    try {
      const deletedBy = localStorage.getItem("id");
      const response = await PharmacyAPI.reject({
        pharmacyId: pharmacyData._id.toString(),
        deletedBy,
        reason,
      });

      console.log('Reject Response:', response);
      setNotification(response.message || 'Pharmacy rejected successfully.');
      setIsModalOpen(true);
      fetchRecord(); // Refresh records if needed
    } catch (error) {
      console.error(error);
      setNotification('An error occurred while rejecting the pharmacy.');
      setIsModalOpen(true);
    }
  };

  const handleViewPharmacyData = (pharmacy) => {
    console.log("Viewing Pharmacy Data:", pharmacy);
    setPharmacyData(pharmacy);
    setIsViewing(true);
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sortedResults = [...searchResults].sort((a, b) => {
      if (direction === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setSearchResults(sortedResults);
  };

  const handleNotificationClose = () => {
    setIsModalOpen(false);
    setIsViewing(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-2">
      {!isViewing && (
        <>
          <div className="flex flex-col md:flex-row mb-2">
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
          </div>

          <div className="mt-2">
            <div className="overflow-x-auto">
              {searchResults.length === 0 ? (
                <p className="text-center text-gray-500">No unauthorized records available.</p>
              ) : (
                <table className="min-w-full bg-white shadow-md rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      {['ID', 'Name', 'Phone No', 'Created At', 'Status'].map((field) => (
                        <th
                          key={field}
                          onClick={() => handleSort(field.toLowerCase())}
                          className="cursor-pointer px-4 py-2 text-left text-sm font-semibold"
                          style={{ color: brandColor }}
                        >
                          {field.charAt(0).toUpperCase() + field.slice(1).replace('.', ' ')}
                          {sortField === field.toLowerCase() && (
                            <FontAwesomeIcon icon={sortDirection === "asc" ? faCaretUp : faCaretDown} className="ml-1" style={{ color: brandColor }} />
                          )}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((pharmacy) => (
                      <tr key={pharmacy._id} className="hover:bg-gray-100 transition duration-300">
                        <td className="py-4 px-4 border-b border-gray-200 text-sm">{pharmacy._id}</td>
                        <td className="px-4 border-b border-gray-200 text-sm">{pharmacy.name}</td>
                        <td className="px-4 border-b border-gray-200 text-sm">{pharmacy.phone}</td>
                        <td className="px-3 py-4 border-b border-gray-200 text-sm">{new Date(pharmacy.createdAt).toLocaleString()}</td>
                        <td className={`px-4 border-b border-gray-200 text-sm ${pharmacy.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                          {pharmacy.status}
                        </td>
                        <td className="px-2 border-b border-gray-200 text-sm">
                          <button
                            onClick={() => handleViewPharmacyData(pharmacy)}
                            className="custom-button transition duration-200 px-2 py-1 rounded"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center space-x-2 mt-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-4 rounded-l-lg"
              style={{ background: brandColor, color: "white" }}
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 ${currentPage === index + 1 ? 'bg-gray-600 text-black' : 'bg-gray-100'} rounded-none`}
                style={currentPage === index + 1 ? { backgroundColor: brandColor, color: 'white' } : {}}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-4 rounded-r-lg"
              style={{ background: brandColor, color: "white" }}
            >
              Next
            </button>
          </div>
        </>
      )}

      {isViewing && (
        <ViewPharmacyDetail
          pharmacyData={pharmacyData}
          handleCancel={() => {
            setIsViewing(false);
            setIsRejecting(false); 
          }}
          onReject={handleReject} 
        />
      )}

      {isRejecting && (
        <RejectPharmacyModal
          pharmacyId={pharmacyData._id.toString()}
          onReject={handleReject} 
          onCancel={() => setIsRejecting(false)}
        />
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/4">
            <h2 className="text-xl mb-4" style={{ color: brandColor }}>
              {notification}
            </h2>
            <div className="flex justify-center space-x-1">
              <button
                onClick={handleNotificationClose}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorisePharmacy;