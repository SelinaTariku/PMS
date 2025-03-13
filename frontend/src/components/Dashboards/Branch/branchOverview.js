import React, { useState, useEffect } from "react";
import BranchDetails from './branchDetails';

const BranchOverview = () => {
  const [summaryData, setSummaryData] = useState({
    totalRegistered: 0,
    totalActive: 0,
    totalDisabled: 0,
    totalUnauthorized: 0,
    dailyRegistration: 0,
    dailyApproved: 0,
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
 const brandColor = localStorage.getItem('brandColor');
  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/branches/branchOverview"
        );
        const result = await response.json();
        setSummaryData(result);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
  }, []);

  const Card = ({ title, value, category }) => (
    <div
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg cursor-pointer"
      onClick={() => {
        setSelectedCategory(category);
      }}
    >
    <h2 className="text-gray-600" style={{ color: brandColor }}>{title}</h2>
      <div className="flex items-center justify-between mt-2">
        <span className="text-3xl font-bold" style={{ color: brandColor }}>{value}</span>
      </div>
    </div>
  );

  useEffect(() => {
  }, [selectedCategory]);

  return (
    <div className="bg-gray-100 p-6">
      <div className="container mx-auto w-full max-w-screen-2xl">
        {!selectedCategory ? (
          <>
            <h1 className="text-xl font-bold mb-4 " style={{ color: brandColor }}>Branch Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8" style={{ color: brandColor }}>
              <Card
                title="Total Registered"
                value={summaryData.totalRegistered}
                category="TotalRegistered"
              />
              <Card
                title="Total Active"
                value={summaryData.totalActive}
                category="TotalActive"
              />
              <Card
                title="Total Disabled"
                value={summaryData.totalDisabled}
                category="TotalDisabled"
              />
              <Card
                title="Daily Registration"
                value={summaryData.dailyRegistration}
                category="DailyRegistration"
              />
    
            </div>
          </>
        ) : (
          <BranchDetails category={selectedCategory} goBack={() => setSelectedCategory(null)} brandColor={brandColor}/>
        )}
      </div>
    </div>
  );
};

export default BranchOverview;
