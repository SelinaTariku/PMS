import React, { useEffect, useState } from "react";
import Header from "../components/Header"; 
import Sidebar from "../components/Sidebar"; 
import Footer from "../components/Footer"; 
import { Outlet } from "react-router-dom"; 

const PortalPage = () => {
  const [pharmacyLogo, setPharmacyLogo] = useState(localStorage.getItem('PharmacyLogo') || '/path/to/default/logo.png');

  // Debugging: Log the pharmacyLogo value
  console.log("Pharmacy Logo in PortalPage:", pharmacyLogo);

  // Listen for changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setPharmacyLogo(localStorage.getItem('PharmacyLogo') || '/path/to/default/logo.png');
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-full">
      <Header /> 
      <div className="flex flex-1 overflow-hidden">
        <Sidebar /> 
        <main className="flex-1 p-4 bg-gray-100 w-full">
          <Outlet /> 
        </main>
      </div>
      <Footer /> 
    </div>
  );
};

export default PortalPage;