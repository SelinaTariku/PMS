import React from 'react';
import { FaLinkedin, FaYoutube, FaFacebook, FaTelegram, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import logo from '../../assets/Image/logo.png';

function Footer() {
  return (
    <footer className="bg-[#1E467A] text-white">
      <div className="container mx-auto flex flex-col md:flex-row items-start">
        
        {/* Logo and Copyright Section */}
        <div className="flex flex-col items-start md:mb-0 md:w-1/3 mb-4"> {/* Align to left */}
          <img src={logo} alt="Pharma Sphere Solution logo" height="20" width="200" className="mb-1" />
          <p className="text-left text-sm"> {/* Align text to left */}
            &copy; 2024 Selamawit Tariku and Biniyam Solomon
          </p>
        </div>
        
        {/* Address Section */}
        <div className="md:w-1/3 mb-4 md:mb-0">
          <h3 className="font-bold text-left text-sm"> {/* Align text to left */}
            Address
          </h3>
          <p className="flex items-center mb-1 text-sm">
            <FaMapMarkerAlt className="mr-2" /> Arat Kilo
          </p>
          <p className="flex items-center mb-1 text-sm">
            <FaPhone className="mr-2" /> +25194348192
          </p>
          <p className="flex items-center mb-1 text-sm">
            <FaEnvelope className="mr-2" /> pharmasphere@gmail.com
          </p>
        </div>
        
        {/* Social Media Section */}
        <div className="md:w-1/3">
          <h3 className="font-bold text-left text-sm"> {/* Align text to left */}
            Social Media
          </h3>
          <p className="flex items-center mb-1 text-sm">
            <FaLinkedin className="mr-2" /> LinkedIn
          </p>
          <p className="flex items-center mb-1 text-sm">
            <FaYoutube className="mr-2" /> YouTube
          </p>
          <p className="flex items-center mb-1 text-sm">
            <FaFacebook className="mr-2" /> Facebook
          </p>
          <p className="flex items-center mb-1 text-sm">
            <FaTelegram className="mr-2" /> Telegram
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;