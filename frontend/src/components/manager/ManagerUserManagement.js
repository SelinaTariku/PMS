import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faEye, faFileAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Api from './API';
import SearchBar from './userSerachBarManager';
import Form from './userFormManager';

const UserManagement = ({ brandColor }) => {
  const [selectedTable, setSelectedTable] = useState('Live');
  const [moreActionOpen, setMoreActionOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [RecordId, setRecordId] = useState('');
  const [RecordData, setRecordData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [allRecord, setAllRecord] = useState([]); 

  const moreActionRef = useRef(null);
  const searchDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreActionRef.current && !moreActionRef.current.contains(event.target)) setMoreActionOpen(false);
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) setSearchDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      let data;
      try {
        if (selectedTable === 'Live') data = await Api.fetchAllLive();
        else if (selectedTable === 'Unauthorized') data = await Api.fetchAllNAU();
        else if (selectedTable === 'History') data = await Api.fetchAllHIS();
        setAllRecord(data || []); 
      } catch (error) {
        console.error("Error fetching records:", error);
        setAllRecord([]); 
      }
    };
    fetchRecord();
  }, [selectedTable]);

  const toggleDropdown = async () => {
    setSearchDropdownOpen(prev => !prev);
    if (!searchDropdownOpen) {
      let data;
      try {
        if (selectedTable === 'Live') data = await Api.fetchAllLive();
        else if (selectedTable === 'Unauthorized') data = await Api.fetchAllNAU();
        else if (selectedTable === 'History') data = await Api.fetchAllHIS();
        setAllRecord(data || []);
      } catch (error) {
        console.error("Error fetching records:", error);
        setAllRecord([]);
      }
    }
  };

  const fetchRecordData = async (id, mode) => {
    if (id.trim()) {
      const data = await Api.fetchLiveById(id);
      if (data) {
        setRecordData(data);
        setIsEditing(mode === 'edit');
        setIsViewing(mode === 'view');
      } else {
        alert('User ID not found.');
        handleNewRecord();
      }
    }
  };

  const handleMoreActionClick = () => setMoreActionOpen(prev => !prev);
  const handleTableSelection = (value) => setSelectedTable(value);
  const handleSearchDropdownClick = toggleDropdown;
  const handleRecordSelect = (record) => {
    setRecordId(record._id);
    setSearchDropdownOpen(false);
  };

  const handleCreateRecordData = async () => {
    if (RecordId.trim()) {
      const existingData = await Api.fetchLiveById(RecordId);
      const existingNAUData = await Api.fetchNAUById(RecordId);
      if (!existingData && !existingNAUData) {
        handleNewRecord();
      } else {
        alert('User ID already exists.');
      }
    }
  };

  const handleSaveChanges = async () => {
    if (RecordId.trim() && RecordData) {
      const savedData = await Api.updateRecord(RecordId, RecordData);
      if (savedData) {
        setRecordData(savedData);
        setIsEditing(false);
        alert('Data saved successfully!');
      } else alert('Failed to save data');
    } else alert('Please fill all fields before saving.');
  };

  const handleCancelEdit = () => setIsEditing(false);
  const handleNewRecord = () => {
    setRecordData({
      _id: RecordId,
      userName: '',
      signOnName: '',
      role: '',
      address: {},
      contactInfo: {},
      branches: '',
      pharmacy: '',
      status: '',
      lock: '',
      createdBy: '',
      createdAt: '',
      profileStartDate: '',
      attempts: '',
      authorisedBy: '',
      authorisedAt: '',
      CURR: ''
    });
    setIsEditing(true);
    setIsViewing(false);
  };

  const handleBackToList = () => {
    setIsEditing(false);
    setIsViewing(false);
    setRecordData(null);
  };

  const handleFileChange = (e, name) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setRecordData((prevData) => {
        const updatedData = { ...prevData };
        const keys = name.split('.');
        if (keys.length === 1) {
          updatedData[name] = reader.result;
        } else {
          let nestedData = updatedData;
          for (let i = 0; i < keys.length - 1; i++) {
            nestedData = nestedData[keys[i]];
          }
          nestedData[keys[keys.length - 1]] = reader.result;
        }
        return updatedData;
      });
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!isEditing && !isViewing && (
        <div className="flex flex-wrap items-center justify-start bg-white p-4 shadow-md">
          <div className="flex space-x-1 mb-1 md:mb-0">
            <button className="text-white p-1 rounded w-20 h-7" style={{ backgroundColor: brandColor }}
              onClick={() => fetchRecordData(RecordId, 'edit')}>
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button className="text-white p-1 rounded w-20 h-7" style={{ backgroundColor: brandColor }}
              onClick={() => fetchRecordData(RecordId, 'view')}>
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button className="text-white p-1 rounded w-20 h-7" style={{ backgroundColor: brandColor }}
              onClick={handleCreateRecordData}>
              <FontAwesomeIcon icon={faFileAlt} />
            </button>

            <div className="relative" ref={moreActionRef}>
              <button className="h-7 ml-3 text-white px-3 py-1 rounded" style={{ backgroundColor: brandColor }} onClick={handleMoreActionClick}>
                More Action
              </button>
              {moreActionOpen && (
                <div className="absolute mt-1 ml-3 w-35 bg-white border border-gray-200 rounded shadow-lg z-10">
                  {['Live', 'Unauthorized', 'History'].map((table) => (
                    <a key={table} href="#" className="block px-2 pb-2 h-7 hover:bg-[#BCCCE1]" style={{ color: brandColor }}
                      onClick={() => handleTableSelection(table)}>
                      {table.charAt(0).toUpperCase() + table.slice(1)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!isEditing && !isViewing && (
        <SearchBar
          RecordId={RecordId}
          handleInputChange={(e) => setRecordId(e.target.value)}
          handleSearchDropdownClick={handleSearchDropdownClick}
          searchDropdownOpen={searchDropdownOpen}
          allRecord={allRecord}
          handleRecordSelect={handleRecordSelect}
          handleNewRecord={handleNewRecord}
          brandColor={brandColor}
          selectedTable={selectedTable}
        />
      )}

      {RecordData && (isEditing || isViewing) && (
        <div>
          {isViewing && (
            <button 
              onClick={handleBackToList} 
              className="text-white p-2 rounded mb-4" style={{ backgroundColor: brandColor }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
          )}
          <Form
            brandColor={brandColor}
            RecordData={RecordData}
            handleInputChange={(e) => setRecordData({ ...RecordData, [e.target.name]: e.target.value })}
            handleNestedInputChange={(e, parentKey) => setRecordData({ 
              ...RecordData, [parentKey]: { ...RecordData[parentKey], [e.target.name]: e.target.value } })}
            isEditable={isEditing}
            handleSaveChanges={handleSaveChanges}
            handleCancelEdit={handleCancelEdit}
            handleFileChange={handleFileChange}
          />
        </div>
      )}
    </div>
  );
};

export default UserManagement;
