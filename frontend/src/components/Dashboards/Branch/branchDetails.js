import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";

const BranchDetails = ({ category, goBack, brandColor }) => {
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createdBy, setCreatedBy] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:5000/branches/branchDetails/${category}`);
        if (!response.data) {
          throw new Error("No data found");
        }
        setDetailData(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [category]);

  useEffect(() => {
    if (detailData.length > 0) {
      const fetchCreatedBy = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/users/getUserById/${detailData[0].createdBy}`);
          setCreatedBy(response.data.email);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchCreatedBy();
    }
  }, [detailData]);

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...detailData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';

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
  }, [detailData, sortConfig]);

  return (
    <div className="bg-gray-10 min-h-screen max-w-screen-lg absolute">
      <div className="flex items-center space-x-4 mb-3">
        {/* Back Button */}
        <button
          onClick={goBack}
          className="relative p-3 text-white rounded-full shadow-lg hover:bg-[#1E467A]"
          style={{ background: brandColor }}
        >
          <FaArrowLeft size={15} />
        </button>

        {/* Heading */}
        <h1 className="text-xl font-semibold text-center" style={{ color: brandColor }}>
          Details for {category}
        </h1>
      </div>

      {/* Loading and Error Handling */}
      {loading && (
        <div className="text-center text-gray-600" style={{ color: brandColor }}>
          Loading...
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center" style={{ color: brandColor }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white p-1 rounded-lg shadow-lg">
          {sortedData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr>
                    {["mnemonic", "name", "status", "workingHours", "createdBy", "createdAt", "averageRate", "rateCount", "views"].map((header) => (
                      <th
                        key={header}
                        className="border-b px-3 py-2 text-left text-sm"
                        style={{ color: brandColor }}
                        onClick={() => requestSort(header)}
                      >
                        <div className="flex items-center justify-between">
                          {header.charAt(0).toUpperCase() + header.slice(1).replace(/([A-Z])/g, ' $1')}
                          {sortConfig.key === header && (
                            sortConfig.direction === 'ascending' ? <FaSortUp className="ml-1" /> : <FaSortDown className="ml-1" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((branch) => (
                    <tr key={branch._id}>
                      <td className="border-b py-2 px-3 text-sm">{branch.mnemonic}</td>
                      <td className="border-b py-2 px-3 text-sm">{branch.name}</td>
                      <td className="border-b py-2 px-3 text-sm">
                        <span className={`text-sm ${branch.status === "Active" ? "text-green-600" : "text-red-600"}`}>
                          {branch.status}
                        </span>
                      </td>
                      <td className="border-b py-2 px-3 text-sm">{branch.workingHours}</td>
                      <td className="border-b py-2 px-3 text-sm">{createdBy || "N/A"}</td>
                      <td className="border-b py-2 px-3 text-sm">
                        {isValidDate(branch.createdAt) ? new Date(branch.createdAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="border-b py-2 px-3 text-sm">{branch.rate?.average || "N/A"}</td>
                      <td className="border-b py-2 px-3 text-sm">{branch.rate?.count || "N/A"}</td>
                      <td className="border-b py-2 px-3 text-sm">{branch.views || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No branch available for this category.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchDetails;