
import React, { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

const BranchDetails = ({ category, goBack, brandColor }) => {
  const [detailData, setDetailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetailData = async () => {
      setLoading(true);
      try {
        const id = localStorage.getItem("pharmacy");
        const response = await fetch(
          `http://localhost:5000/branches/branchDetailsByPharmacy/${id}/${category}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setDetailData(result);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchDetailData();
  }, [category]);

  const isValidDate = (date) => {
    return date && !isNaN(new Date(date).getTime());
  };

  return (
    <div className="bg-gray-100 max-w-screen-lg ">
      <div className="flex items-center space-x-2 max-w-screen-lg mx-auto">
        <button
          onClick={goBack}
          className="relative p-3 text-white rounded-full shadow-lg hover:bg-[#1E467A]"
          style={{ background: brandColor }}
        >
          <FaArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-bold text-center" style={{ color: brandColor }}>
          Details for {category}
        </h1>
      </div>

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
        <div className="bg-white p-4 rounded-lg shadow-lg">
          {detailData.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full table-auto border-collapse w-full">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>ID</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Name</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Mnemonic</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Status</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Working Hours</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Location</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Pharmacy Id</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Created At</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Created By</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>CURR</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Views</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Authorised At</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Authorised By</th>
                    <th className="border-b px-4 py-2" style={{ color: brandColor }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {detailData.map((branch) => (
                    <tr key={branch._id}>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch._id}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.name}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.mnemonic}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        <span
                          className={`text-sm ${branch.status === "Active" ? "text-green-600" : "text-red-600"}`}
                        >
                          {branch.status}
                        </span>
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.workingHours}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.location.coordinates}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.pharmacyId}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {isValidDate(branch.createdAt)
                          ? new Date(branch.createdAt).toLocaleString()
                          : null}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.createdBy}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.CURR}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.views}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {isValidDate(branch.authorisedAt)
                          ? new Date(branch.authorisedAt).toLocaleString()
                          : null}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.authorisedBy}
                      </td>
                      <td className="border-b py-2 px-4" style={{ color: brandColor }}>
                        {branch.rate.average}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-600" style={{ color: brandColor }}>
              No branch available for this category.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default BranchDetails;
