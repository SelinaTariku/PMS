import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

const SearchBar = ({
  brandColor,
  branchId,
  handleInputChange,
  handleSearchDropdownClick,
  searchDropdownOpen,
  allRecord,
  handlebranchSelect,
  handleNewRecord,
  selectedTable,
}) => (
  <div className="flex items-center bg-white pt-2 p-2 shadow-md h-10">
    <label htmlFor="search" className="mr-4 mb-2 md:mb-0 " style={{ color: brandColor }}>Branch ID</label>
    <div className="relative flex-grow mb-2 md:mb-0">
      <input
        id="search"
        type="text"
        className="w-full h-7 p-2 border border-gray-300 rounded"
        placeholder="Enter branch ID"
        style={{ color: brandColor }}
        value={branchId}
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
          className="absolute right-0 w-full max-h-50 bg-white border border-gray-200 rounded shadow-lg z-10"
          style={{ maxHeight: '600px' }} 
        >
          <div className="overflow-y-auto max-h-[300px]"> 
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>ID</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Name</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Mnemonic</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Status</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Created By</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Created At</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Authorized By</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Authorized At</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm" style={{ color: brandColor }}>Updated By</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Updated At</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Branches</th>
                  <th className="px-4 border-b border-gray-200 text-left text-sm " style={{ color: brandColor }}>Version</th>
                </tr>
              </thead>
              <tbody>
                {allRecord.map((branch) => (
                  <tr key={branch._id} className="hover:bg-[#BCCCE1]" onClick={() => handlebranchSelect(branch)}>
                    <td className="py-4 px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch._id}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.name}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.mnemonic}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.status}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.createdBy}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.createdAt}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.authorizedBy}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.authorisedAt}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.updatedBy}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.updatedAt}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.noOfBranch}</td>
                    <td className="px-4 border-b border-gray-200 text-sm" style={{ color: brandColor }}>{branch.CURR}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedTable && (
            <div className="px-4 py-2 mt-2 text-sm text-gray-700" style={{ color: brandColor }}> 
              <strong>Selected Table: </strong>{selectedTable}
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);

export default SearchBar;
