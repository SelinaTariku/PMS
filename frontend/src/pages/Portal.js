import React, { useEffect, useState } from "react";
import Header from "../components/Header"; 
import Sidebar from "../components/Sidebar"; 
import Footer from "../components/Footer"; 
import { Outlet } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const PortalPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isVisible, setIsVisible] = useState(true); 
  const [pharmacyLogo, setPharmacyLogo] = useState(localStorage.getItem('PharmacyLogo') || '/path/to/default/logo.png');
const brandColor = localStorage.getItem('brandColor')
  console.log("Pharmacy Logo in PortalPage:", pharmacyLogo);

  useEffect(() => {
    const handleStorageChange = () => {
      setPharmacyLogo(localStorage.getItem('PharmacyLogo') || '/path/to/default/logo.png');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleSidebarVisibility = () => {
    setIsVisible(!isVisible); 
  };

  return (
    <div className="flex flex-col max-h-screen min-h-screen">
      <Header /> 
      <div className="flex flex-1 flex-col md:flex-row mt-1 p-4">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} isVisible={isVisible} /> 
        <div className="flex justify-start h-10 mr-2 ">
          <button
            onClick={toggleSidebarVisibility}
            className="rounded-full p-2"
            style={{ background: brandColor, color: "white" }} 
          >
            <FontAwesomeIcon icon={isVisible ? faArrowLeft : faArrowRight} />
          </button>
        </div>
        <main className="flex-1 bg-gray-100 w-full overflow-y-auto max-h-100 min-h-100">
          <Outlet /> 
        </main>
      </div>
      <Footer className="max-h-20" />
    </div>
  );
};

export default PortalPage;