import React, { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const SearchInput = React.memo(({ value, onChange, onClear, placeholder }) => {
  const inputRef = useRef(null);
  const brandColor = "#1E467A";

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="relative flex-grow">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full py-3 pl-12 pr-4 border-2 rounded-xl focus:outline-none focus:ring-2 bg-transparent peer"
          style={{ borderColor: brandColor }}
          placeholder=" "
          value={value}
          onChange={onChange}
        />
        <label 
          className="absolute left-12 top-1/2 -translate-y-1/2 px-1 bg-white text-gray-500 transition-all duration-200
                     peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-base
                     peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-600 pointer-events-none"
          style={{ color: brandColor }}
        >
          {placeholder}
        </label>
      </div>
      <FontAwesomeIcon
        icon={faSearch}
        className="absolute left-4 top-1/2 transform -translate-y-1/2" 
        style={{ color: brandColor }}
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
});

export default SearchInput;