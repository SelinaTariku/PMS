import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="fixed top-5 left-0 bg-white border-b-2 border-[#F5F5F5] w-full z-50 mt-10">
      <ul className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-8 py-3 px-10">
        {['Home', 'About Us', 'News & Events', 'Subscribe', 'Contact Us'].map((item, index) => (
          <li key={index}>
            <Link
              to={`/${item.replace(/ & /g, '&').replace(/ /g, '').toLowerCase()}`} // Adjusted to match route paths
              className="px-4 py-1 font-bold text-lg rounded text-[#1E467A] hover:bg-[#1E467A] hover:text-white"
              style={{ fontFamily: 'Times New Roman' }}
            >
              {item}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
