import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin, faYoutube, faFacebook, faTelegram } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
    const brandColor = localStorage.getItem('brandColor');
    const pharmacyLogo = localStorage.getItem('PharmacyLogo');
    return (
        <footer className="text-white p-2 md:p-4 h-24" style={{ backgroundColor: brandColor }}>
            <div className="flex flex-col md:flex-row justify-between items-center h-full">
                <div className="mb-2 md:mb-0">
                    <img src={pharmacyLogo} alt="Pharmacy Logo" className="h-8 w-auto mb-1" />
                    <p className="text-xs">Copyright © 2024 Selamawit Tariku and Binyam Solomon</p>
                </div>
                <div className="mb-2 md:mb-0 text-xs">
                    <h2 className="font-bold mb-1">Address Information</h2>
                    <p>Arat Killo</p>
                    <p>+25194938192</p>
                    <p>pharmasphere@gmail.com</p>
                </div>
                <div className="text-xs">
                    <h2 className="font-bold mb-1">Social Media</h2>
                    <p><FontAwesomeIcon icon={faLinkedin} className="mr-2" />LinkedIn</p>
                    <p><FontAwesomeIcon icon={faYoutube} className="mr-2" />Youtube</p>
                    <p><FontAwesomeIcon icon={faFacebook} className="mr-2" />Facebook</p>
                    <p><FontAwesomeIcon icon={faTelegram} className="mr-2" />Telegram</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;