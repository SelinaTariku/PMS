// MainPage.js
import React from 'react';
import Header from '../../components/Customner/Header';
import Sidebar from '../../components/Customner/Customersidebar';
import Footer from '../../components/web/Footer';
import { Outlet } from "react-router-dom"; 

const WebPages = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <Sidebar />
            <main>
                <Outlet /> 
            </main>
            <Footer />
        </div>
    );
};

export default WebPages;