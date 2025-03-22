import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const PharmacyDetails = ({ category, goBack, brandColor }) => {
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/pharmacies/pharmacyDetails/` + category
        );

        if (response.status === 403) {
          throw new Error("Access denied");
        } else if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setDetailData(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [category]);

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = detailData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(detailData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="bg-gray-100 flex-col max-h-80 min-h-80">
      <div className="flex items-center space-x-4 mb-2">
        <button
          onClick={goBack}
          className="p-3 text-white rounded-full shadow-lg hover:bg-[#1E467A]"
          style={{ background: brandColor }}
        >
          <FaArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-semibold text-center flex-1" style={{ color: brandColor }}>
          Pharmacy Details for {category}
        </h1>
      </div>

      {loading && (
        <div className="text-center text-gray-600 mb-4" style={{ color: brandColor }}>
          Loading...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mt-5" style={{ color: 'red', fontSize: 16 }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {detailData.length > 0 ? (
            <div>
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-[${brandColor}] text-white">
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>Name</th>
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>Status</th>
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>Location</th>
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>City</th>
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>Registration Date</th>
                    <th className="border-b px-2 py-3 text-left text-sm" style={{ color: brandColor }}>Authorized Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((pharmacy) => (
                    <tr key={pharmacy._id} className="hover:bg-gray-100 cursor-pointer transition-all">
                      <td className="border-b py-3 px-2 text-sm">{pharmacy.name}</td>
                      <td className="border-b py-3 px-2 text-sm">
                        <span className={`text-sm ${pharmacy.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                          {pharmacy.status}
                        </span>
                      </td>
                      <td className="border-b py-3 px-2 text-sm">{pharmacy.street}</td>
                      <td className="border-b py-3 px-2 text-sm">{pharmacy.city}</td>
                      <td className="border-b py-3 px-2 text-sm">
                        {isValidDate(pharmacy.createdAt) ? new Date(pharmacy.createdAt).toLocaleString() : null}
                      </td>
                      <td className="border-b py-3 px-2 text-sm">
                        {isValidDate(pharmacy.authorisedAt) ? new Date(pharmacy.authorisedAt).toLocaleString() : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: brandColor }} className="text-center mt-4">No pharmacies available for this category.</p>
          )}

          <div className="flex justify-center items-center mt-4 space-x-4 flex-wrap">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-1 rounded-lg"
                style={{ background: brandColor, color: "white" }}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-1 ${currentPage === index + 1 ? 'bg-gray-600 text-white' : 'bg-gray-100'} rounded-lg`}
                  style={currentPage === index + 1 ? { backgroundColor: brandColor, color: 'white' } : {}}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-1 rounded-lg"
                style={{ background: brandColor, color: "white" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyDetails;