import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({
  RecordId,
  handleInputChange,
  handleSearchDropdownClick,
  searchDropdownOpen,
  allRecord,
  handleRecordSelect,
  handleNewRecord,
  brandColor,
  selectedTable
}) => (
  <div className="flex items-center bg-white pt-2 p-2 shadow-md h-10">
    <label htmlFor="search" className="mr-4 mb-2 md:mb-0 " style={{ color: brandColor }}>User ID</label>
    <div className="relative flex-grow mb-2 md:mb-0">
      <input
        id="search"
        type="text"
        className="w-full h-7 p-2 border border-gray-300 rounded"
        placeholder="Enter User ID"
        style={{ color: brandColor }}
        value={RecordId}
        onChange={handleInputChange}
      />
      <button
        className="absolute right-0 top-0 h-full text-white p-1 rounded-r"
        style={{ backgroundColor: brandColor }}
        onClick={handleSearchDropdownClick}
      >
        <FontAwesomeIcon icon={faCaretDown} />
      </button>
      {searchDropdownOpen && (
        <div
          className="absolute right-0 w-full bg-white border border-gray-200 rounded shadow-lg z-10 overflow-x-auto"
          style={{ maxHeight: '600px' }} 
       >
         <div className="overflow-y-auto max-h-[300px]">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>ID</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>signOnName</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Name</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Status</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Created By</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Created At</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Authorized By</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Authorized At</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm" style={{ color: brandColor }}>Updated By</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Updated At</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Role</th>
                <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Version</th>
              </tr>
            </thead>
            <tbody>
              {allRecord.map((record) => (
                <tr key={record._id} className="hover:bg-[#BCCCE1]" onClick={() => handleRecordSelect(record)}>
                  <td className="py-4 px-4 border-b border-gray-200 text-sm">{record._id}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.signOnName}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.userName}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.status}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.createdBy}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.createdAt}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.authorisedBy}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.authorisedAt}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.updatedBy}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.updatedAt}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.role}</td>
                  <td className="px-4 border-b border-gray-200 text-sm">{record.CURR}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {selectedTable && (
            <div className="px-4 py-2 mt-2 text-sm text-gray-700">
              <strong>Selected Table: </strong>{selectedTable}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default SearchBar;
