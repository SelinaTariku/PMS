import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/storeKeeper/storekeeperSideBar';
import Content from '../../components/storeKeeper/StorekeeperrouteContentRoutes';
import Footer from '../../components/footer';

const AdminDashboard = () => {
    const [userName, setUserName] = useState('');
    const [pharmacyLogo, setPharmacyLogo] = useState('');          
    const [brandColor, setBrandColor] = useState('#1E467A'); 
    const [activeMainItem, setActiveMainItem] = useState('Dashboard');
    const [activeSubItem, setActiveSubItem] = useState('PharmacyOverview');
    const [isDashboardOpen, setIsDashboardOpen] = useState(true);
    const [isAccountSettingOpen, setIsAccountSettingOpen] = useState(false);

    useEffect(() => {
        const storedUserName = localStorage.getItem('username');
        const brandColor = localStorage.getItem('brandColor');
        if (storedUserName) {
            setUserName(storedUserName);
        }
         
        const pharmacyID = localStorage.getItem('pharmacy');

        const fetchPharmacyDetails = async () => { 
            try {
                const response = await fetch(`http://localhost:5000/pharmacies/getPharmacyById/${pharmacyID}`); 
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPharmacyLogo(data.logo || "http://www.shutterstock.com/image-vector/pharmacy-medicine-health-care-hospital-260nw-2507426469.jpg");
                setBrandColor(data.brandColor || '#1E467A');
            } catch (error) {
                console.error('Error fetching pharmacy details:', error);
            }
        };

        if (pharmacyID) {
            fetchPharmacyDetails();
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 font-sans">
            <Header brandColor={brandColor} pharmacyLogo={pharmacyLogo} userName={userName} />
            <div className="flex flex-col md:flex-row flex-1">

                <Sidebar 
                    brandColor={brandColor} 
                    activeMainItem={activeMainItem} 
                    setActiveMainItem={setActiveMainItem} 
                    activeSubItem={activeSubItem} 
                    setActiveSubItem={setActiveSubItem} 
                    isDashboardOpen={isDashboardOpen} 
                    setIsDashboardOpen={setIsDashboardOpen} 
                    isAccountSettingOpen={isAccountSettingOpen} 
                    setIsAccountSettingOpen={setIsAccountSettingOpen} 
                    className="w-64"  
                />
                <div className="flex-1 p-4">
                    <Content brandColor={brandColor} activeMainItem={activeMainItem} activeSubItem={activeSubItem} />
                </div>
            </div>
            <Footer brandColor={brandColor} pharmacyLogo={pharmacyLogo} />
        </div>
    );
};

export default AdminDashboard;