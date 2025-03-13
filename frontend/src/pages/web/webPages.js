// MainPage.js
import React from 'react';
import Header from '../../components/web/Header';
import NavigationBar from '../../components/web/Navbar';
import Footer from '../../components/web/Footer';
import { Outlet } from "react-router-dom"; 


const webPages = () => {
    return (
        <div className="flex flex-col h-screen w-full">
            <Header />
            <NavigationBar />
            <main className="flex-1 p-4 bg-gray-100 w-full">
          <Outlet /> 
        </main>
            <Footer />
        </div>
    );
};

export default webPages;