import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaSpinner } from "react-icons/fa";

const PharmacyDetails = ({ category, goBack, brandColor = "#007bff" }) => {
  // State management
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Memoized data calculations
  const { currentItems, totalPages } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = pharmacies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(pharmacies.length / itemsPerPage);
    return { currentItems, totalPages };
  }, [pharmacies, currentPage, itemsPerPage]);

  // Data fetching
  useEffect(() => {
    const fetchPharmacyData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/pharmacies/pharmacyDetails/${category}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 403 ? "Access denied" : "Failed to fetch data"
          );
        }

        const data = await response.json();
        setPharmacies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyData();
  }, [category]);

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return null;
    return new Date(dateString).toLocaleString();
  };

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Render functions
  const renderStatusBadge = (status) => (
    <span
      className={`text-sm font-medium px-2 py-1 rounded ${
        status === "Active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );

  const renderPagination = () => (
    <div className="flex justify-center items-center mt-4 space-x-2">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-1 rounded-lg disabled:opacity-50 transition"
        style={{ backgroundColor: brandColor, color: "white" }}
      >
        Previous
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`px-4 py-1 rounded-lg transition ${
            currentPage === page ? "font-bold" : "hover:bg-gray-200"
          }`}
          style={{
            backgroundColor: currentPage === page ? brandColor : "transparent",
            color: currentPage === page ? "white" : "inherit",
          }}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-1 rounded-lg disabled:opacity-50 transition"
        style={{ backgroundColor: brandColor, color: "white" }}
      >
        Next
      </button>
    </div>
  );

  const renderTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {["Name", "Status", "Location", "City", "Registration Date", "Authorized Date"].map((header) => (
              <th
                key={header}
                className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: brandColor }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.map((pharmacy) => (
            <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                {pharmacy.name}
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                {renderStatusBadge(pharmacy.status)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {pharmacy.street}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {pharmacy.city}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {formatDate(pharmacy.createdAt)}
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                {formatDate(pharmacy.authorisedAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
          Pharmacy Details for {category}
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
      ) : pharmacies.length > 0 ? (
        <>
          {renderTable()}
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
                No pharmacies available for this category.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDetails;