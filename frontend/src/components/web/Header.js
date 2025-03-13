import React from 'react';
import logo from '../../assets/Image/logo.png';

function Header() {
    return (
      <div className="fixed top-0 left-0 flex items-center bg-[#1E467A] h-24 pl-0 pb-3 w-full z-50 shadow-lg"> 
            <img
                alt="PharmaSphere logo"
                className="h-full w-auto glow-effect" 
                src={logo}
            />
            <div className="text-white font-bold text-2xl ml-4 glow-text" style={{ fontFamily: 'Times New Roman' }}> 
                HOME
            </div>
        </div>
    );
}

export default Header;
