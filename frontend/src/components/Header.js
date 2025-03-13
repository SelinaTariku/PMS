import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const brandColor = localStorage.getItem('brandColor') || '#4A90E2';
    const pharmacyLogo = localStorage.getItem('PharmacyLogo');
    const userName = localStorage.getItem('userName') || 'Guest';
    const PharmacyName = localStorage.getItem('PharmacyName') || 'Your Pharmacy';
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();

    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev);
    };

    const closeDropdown = (event) => {
        if (!event.target.closest('#menu-toggle') && !event.target.closest('#dropdown')) {
            setIsDropdownOpen(false);
        }
    };

    React.useEffect(() => {
        document.addEventListener('click', closeDropdown);
        return () => {
            document.removeEventListener('click', closeDropdown);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/PharmacSphere');
    };

    return (
        <header className="flex justify-between items-center w-full" style={{ backgroundColor: brandColor, height: '70px' }}>
            <div className="flex items-center w-full">
                {pharmacyLogo && (
                    <img
                        src={pharmacyLogo}
                        alt="Pharmacy Logo"
                        className="h-full object-cover"
                        style={{ maxHeight: 'full', width: '255px',  marginRight: '10px', marginBottom: '30px'}} 
                    />
                )}
                <span className="text-white font-bold text-2xl" style={{ whiteSpace: 'nowrap' }}>{`${PharmacyName} Pharmacy`}</span>
            </div>
            <div className="relative flex items-center mr-4">
                <span className="mr-3 text-white" style={{ whiteSpace: 'nowrap' }}>{userName}</span>
                <button id="menu-toggle" className="text-white" onClick={toggleDropdown}>
                    <FontAwesomeIcon icon={faBars} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-40 w-40 bg-white shadow-lg rounded p-2 z-10">
                        <div className="flex flex-col space-y-2">
                            <a className="flex items-center hover:text-gray-900" href="#" style={{ color: brandColor }}>
                                <i className="fas fa-user mr-2"></i>
                                <span>Profile</span>
                            </a>
                            <a
                                className="flex items-center text-gray-700 hover:text-gray-900 cursor-pointer"
                                style={{ color: brandColor }}
                                onClick={handleLogout}
                            >
                                <i className="fas fa-sign-out-alt mr-2"></i>
                                <span>Logout</span>
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;