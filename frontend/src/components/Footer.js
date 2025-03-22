import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faYoutube, faFacebook, faTelegram } from '@fortawesome/free-brands-svg-icons';
import logo from '../assets/Image/logo.png'
const Footer = () => {
    const brandColor = localStorage.getItem('brandColor') || '#1E467A'; // Default color if none is set
    const pharmacyLogo = localStorage.getItem('PharmacyLogo');

    return (
        <footer className="text-white p-2" style={{ backgroundColor: brandColor }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className=" items-center mb-1 md:mb-0">
                    {pharmacyLogo && (
                        <img src={logo} alt="Pharmacy Logo" className="h-10 w-auto mr-2" />
                    )}
                    <p className="text-xs md:text-sm mr-2 mt-2">Copyright © 2024 Selamawit Tariku and Binyam Solomon</p>
                </div>
                <div className="mb-2 md:mb-0 mr-40 text-xs md:text-sm">
                    <h2 className="font-bold mb-1">Address Information</h2>
                    <p>Phone Number; +25194938192</p>
                    <p>email: pharmasphere@gmail.com</p>
                </div>
                <div className="text-xs md:text-sm mr-20 ">
                    <h2 className="font-bold mb-1">Social Media</h2>
                    <div className="flex flex-col">
                        <p className="flex items-center"><FontAwesomeIcon icon={faLinkedin} className="mr-2" />LinkedIn</p>
                        <p className="flex items-center"><FontAwesomeIcon icon={faTelegram} className="mr-2" />Telegram</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;