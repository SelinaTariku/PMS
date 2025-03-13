import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencilAlt,
  faEye,
  faFileAlt,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import Api from "./API";
import SearchBar from "./branchSearchBar";
import branchForm from "./branchForm";

const BranchManagement = ({ brandColor }) => {
  const [selectedTable, setSelectedTable] = useState("Live");
  const [moreActionOpen, setMoreActionOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [branchId, setbranchId] = useState("");
  const [branchData, setbranchData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [allRecord, setAllRecord] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewbranch, setIsNewbranch] = useState(false);
  const moreActionRef = useRef(null);
  const searchDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        moreActionRef.current &&
        !moreActionRef.current.contains(event.target)
      )
        setMoreActionOpen(false);
      if (
        searchDropdownRef.current &&
        !searchDropdownRef.current.contains(event.target)
      )
        setSearchDropdownOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      setIsLoading(true);
      let data;
      if (selectedTable === "Live") {
        data = await Api.fetchAllLive();
      } else if (selectedTable === "Unauthorized") {
        data = await Api.fetchAllNAU();
      } else if (selectedTable === "History") {
        data = await Api.fetchAllHIS();
      }
      setAllRecord(data || []);
      setIsLoading(false);
    };
    fetchRecord();
  }, [selectedTable]);

  const toggleDropdown = async () => {
    setSearchDropdownOpen((prev) => !prev);
    if (!searchDropdownOpen) {
      let data;
      if (selectedTable === "Live") {
        data = await Api.fetchAllLive();
      } else if (selectedTable === "Unauthorized") {
        data = await Api.fetchAllNAU();
      } else if (selectedTable === "History") {
        data = await Api.fetchAllHIS();
      }
      setAllRecord(data);
    }
  };

  const fetchRecord = async (id, mode) => {
    if (id.trim()) {
      let data;
      if (selectedTable === "Live") {
        data = await Api.fetchLiveById(id);
      } else if (
        selectedTable === "Unauthorized" ||
        selectedTable === "History"
      ) {
        data = await Api.fetchHISById(id);
      }

      if (data) {
        setbranchData(data);
        setIsEditing(mode === "edit");
        setIsViewing(mode === "view");
      } else {
        alert(`branch ID not found in the ${selectedTable} table.`);
      }
    }
  };

  const handleMoreActionClick = () => setMoreActionOpen((prev) => !prev);
  const handleTableSelection = (value) => {
    setSelectedTable(value);
    setMoreActionOpen(false);
  };

  const handleSearchDropdownClick = toggleDropdown;

  const handlebranchSelect = (branch) => {
    setbranchId(branch._id);
    setSearchDropdownOpen(false);
  };

  const handleCreatebranchData = async () => {
    if (branchId.trim()) {
      const existingData = await Api.fetchLiveById(branchId);
      const existingNAUData = await Api.fetchNAUById(branchId);
      if (!existingData && !existingNAUData) {
        handleNewRecord();
        setIsNewbranch(true);
      } else {
        alert("branch ID already exists.");
      }
    }
  };

  const handleSaveChanges = async () => {
    if (branchId.trim() && branchData) {
      const savedData = await Api.updateData(branchId, branchData);
      if (savedData) {
        setbranchData(savedData);
        setIsEditing(false);
        alert("Data saved successfully!");
      } else {
        alert("Failed to save data");
      }
    } else {
      alert("Please fill all fields before saving.");
    }
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setbranchData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleNewRecord = () => {
    setbranchData({
      address: {},
      contactInfo: {},
      noOfBranch: "",
      _id: branchId,
      name: "",
      logo: "",
      brandColor: "",
      licenceInfo: {},
      branches: [],
      status: "",
      licenseNumber: "",
      CURR: "",
    });
    setIsEditing(true);
    setIsViewing(false);
  };

  const handleBackToList = () => {
    setIsEditing(false);
    setIsViewing(false);
    setbranchData(null);
  };

  const handleFileChange = (e, name) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setbranchData((prevData) => {
        const updatedData = { ...prevData };
        const keys = name.split(".");

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
    <div className="container mx-auto p-4 mt--2">
      {!isEditing && !isViewing && (
        <div className="flex flex-wrap items-center justify-start bg-white p-4 shadow-md">
          <div className="flex space-x-1 mb-1 md:mb-0">
            <button
              className="text-white p-1 rounded w-20 h-7"
              style={{ backgroundColor: brandColor }}
              onClick={() => fetchRecord(branchId, "edit")}
            >
              <FontAwesomeIcon icon={faPencilAlt} />
            </button>
            <button
              className="text-white p-1 rounded w-20 h-7"
              style={{ backgroundColor: brandColor }}
              onClick={() => fetchRecord(branchId, "view")}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="text-white p-1 rounded w-20 h-7"
              style={{ backgroundColor: brandColor }}
              onClick={handleCreatebranchData}
            >
              <FontAwesomeIcon icon={faFileAlt} />
            </button>

            <div className="relative" ref={moreActionRef}>
              <button
                className="h-7 ml-3 text-white px-3 py-1 rounded"
                style={{ backgroundColor: brandColor }}
                onClick={handleMoreActionClick}
              >
                More Action
              </button>
              {moreActionOpen && (
                <div className="absolute mt-1 ml-3 w-35 bg-white border border-gray-200 rounded shadow-lg z-20">
                  {["Live", "Unauthorized", "History"].map((table) => (
                    <a
                      key={table}
                      href="#"
                      className="block px-2 pb-1 h-6 hover:bg-[#BCCCE1]"
                      style={{ color: brandColor }}
                      onClick={() => handleTableSelection(table)}
                    >
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
          brandColor={brandColor}
          branchId={branchId}
          handleInputChange={(e) => setbranchId(e.target.value)}
          handleSearchDropdownClick={handleSearchDropdownClick}
          searchDropdownOpen={searchDropdownOpen}
          allRecord={allRecord}
          handlebranchSelect={handlebranchSelect}
          handleNewRecord={handleNewRecord}
          selectedTable={selectedTable}
        />
      )}

      {branchData && (isEditing || isViewing) && (
        <div>
          {isViewing && (
            <button
              onClick={handleBackToList}
              className="text-white p-2 rounded mb-4"
              style={{ backgroundColor: brandColor }}
            >
              <FontAwesomeIcon icon={faArrowLeft} /> Back
            </button>
          )}
          <branchForm
            branchData={branchData}
            handleInputChange={handleInputChange}
            handleSaveChanges={handleSaveChanges}
            handleCancelEdit={handleCancelEdit}
            handleNestedInputChange={undefined}
            isEditable={isEditing}
            handleFileChange={handleFileChange}
            brandColor={brandColor}
            isNewbranch={isNewbranch}
          />
        </div>
      )}
    </div>
  );
};

export default BranchManagement;
