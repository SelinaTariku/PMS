import React, { useState, useEffect } from "react";
import API from './API';
import BranchDetails from './ManagerBranchDetail';

const BranchOverview = ({ brandColor }) => {
  const [summaryData, setSummaryData] = useState({
    totalRegistered: 0,
    totalActive: 0,
    totalDisabled: 0,
    totalUnauthorized: 0,
    dailyRegistration: 0,
    dailyApproved: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const id = localStorage.getItem('pharmacy');
        const data = await API.fetchBranchByPharmacy(id);
        setSummaryData(data);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
  }, []);

  const Card = ({ title, value, category }) => (
    <div
      className="bg-white p-5 rounded-lg shadow-lg cursor-pointer"
      onClick={() => {
        setSelectedCategory(category);
      }}
    >
      <h2 className="text-gray-600" style={{ color: brandColor }}>{title}</h2>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xl font-bold" style={{ color: brandColor }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-4 w-full">
      <div className="w-full">
        {!selectedCategory ? (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: brandColor }}>Branch Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card
                title="Total Registered"
                value={summaryData.totalRegistered}
                category="Total Registered"
              />
              <Card
                title="Total Active"
                value={summaryData.totalActive}
                category="Total Active"
              />
              <Card
                title="Total Disabled"
                value={summaryData.totalDisabled}
                category="Total Disabled"
              />
              <Card
                title="Unauthorized Branch"
                value={summaryData.totalUnauthorized}
                category="Unauthorized Branch"
              />
              <Card
                title="Daily Registration"
                value={summaryData.dailyRegistration}
                category="Daily Registration"
              />
              <Card
                title="Daily Approved"
                value={summaryData.dailyApproved}
                category="Daily Approved"
              />
            </div>
          </>
        ) : (
          <BranchDetails category={selectedCategory} goBack={() => setSelectedCategory(null)} brandColor={brandColor} />
        )}
      </div>
    </div>
  );
};

export default BranchOverview;