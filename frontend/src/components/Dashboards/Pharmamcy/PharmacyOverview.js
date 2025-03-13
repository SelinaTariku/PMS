import React, { useState, useEffect } from "react";
import PharmacyDetails from './PharmacyDetails';

const PharmacyOverview = () => {
  const [summaryData, setSummaryData] = useState({
    totalRegistered: 0,
    totalActive: 0,
    totalDisabled: 0,
    totalUnauthorized: 0,
    dailyRegistration: 0,
    dailyApproved: 0,
  });
const brandColor = localStorage.getItem('brandColor');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await fetch("http://localhost:5000/pharmacies/PharmacyOverview");
        const result = await response.json();
        setSummaryData(result);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    fetchSummaryData();
    const intervalId = setInterval(fetchSummaryData, 3000); 
    return () => clearInterval(intervalId);
  }, []);

  const Card = ({ title, value, category }) => (
    <div
      className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg cursor-pointer"
      onClick={() => setSelectedCategory(category)}
    >
      <h2 className="text-gray-600" style={{ color: brandColor }}>{title}</h2>
      <div className="flex items-center justify-between mt-2">
        <span className="text-3xl font-bold" style={{ color: brandColor }}>{value}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 p-1">
      <div className="w-full">
        {!selectedCategory ? (
          <>
            <h1 className="text-xl font-bold mb-4" style={{ color: brandColor }}>Pharmacy Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {Object.entries(summaryData).map(([key, value]) => (
                <Card
                  key={key}
                  title={key.replace(/([A-Z])/g, ' $1').trim()} 
                  value={value}
                  category={key}
                />
              ))}
            </div>
          </>
        ) : (
          <PharmacyDetails category={selectedCategory} goBack={() => setSelectedCategory(null)} brandColor={brandColor} />
        )}
      </div>
    </div>
  );
};

export default PharmacyOverview;