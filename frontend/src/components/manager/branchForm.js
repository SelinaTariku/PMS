import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import BranchAPI from "./API";

const requiredFields = [
  "name",
  "brandColor",
  "logo",
  "address.street",
  "address.city",
  "address.state",
  "address.postalCode",
  "address.country",
  "contactInfo.phone",
  "contactInfo.email",
  "licecneInfo.licenceDocument",
  "licenceInfo.licenseExpirationDate",
  "mnemonic",
  "licenseNumber",
  "authorizedBy",
];

const BranchForm = ({
  BranchData,
  handleInputChange,
  handleSaveChanges,
  handleCancelEdit,
  handleNestedInputChange,
  isEditable,
  handleFileChange,
  brandColor,
  isNewBranch,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);

  const saveChanges = async (id) => {
    setIsModalOpen(true);
    setModalAction(() => async () => {
      try {
        if (isNewBranch) {

          const updatedData = {
            ...BranchData,
            createdBy: localStorage.getItem("id"),
          };
          const createdData = await BranchAPI.createData(updatedData);
        if (!createdData) {
          throw new Error(`Failed to Update Branch data from the form`);
        }

        setIsSuccessMessageVisible(true);
        setIsModalOpen(false);
        handleSaveChanges();
        } else {

        const updatedData = {
          ...BranchData,
          updatedBy: localStorage.getItem("id"),
        };
        const data = await BranchAPI.updateData(id, updatedData);
       
        if (!data) {
          throw new Error(`Failed to Update Branch data from the form`);
        }

        setIsSuccessMessageVisible(true);
        setIsModalOpen(false);
        handleSaveChanges();}
      } catch (error) {
        console.error("Error saving Branch data:", error);
        setIsModalOpen(false);
      }
    });
  };

  const closeModal = () => setIsModalOpen(false);

  const handleLogoChange = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      if(name ==='logo'){
        handleFileChange(e, "logo");
      }
      else if(name ==='licenceInfo.licenceDocument'){
        handleFileChange(e, "licenceInfo.licenceDocument");
      }
      
    }
  };

  const handleColorChange = (e) => {
    const value = e.target.value;
    handleInputChange({ target: { name: "brandColor", value } });
  };

  const renderFields = () => {
    if (!BranchData || Object.keys(BranchData).length === 0) {
      return (
        <>
          <div className="flex items-center space-x-1">
            <label className="w-40 text-right">Branch Name</label>
            <input
              type="text"
              name="name"
              className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center space-x-1">
            <label className="w-40 text-right">Brand Color</label>
            <input
              type="color"
              name="brandColor"
              onChange={handleColorChange}
              className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
              required
            />
          </div>

          {/* No of Branch */}
          <div className="flex items-center space-x-1">
            <label className="w-40 text-right">Number of Branches</label>
            <input
              type="text"
              name="noOfBranch"
              className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
              onChange={handleInputChange}
            />
          </div>
          {/* License Number */}
          <div className="flex items-center space-x-1">
            <label className="w-40 text-right">License Number</label>
            <input
              type="text"
              name="licenseNumber"
              className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
              onChange={handleInputChange}
            />
          </div>
          {/* License Expiration Date */}
          <div className="flex items-center space-x-1">
            <label className="w-40 text-right">License Expiration Date</label>
            <input
              type="date"
              name="licenceInfo.licenseExpirationDate"
              onChange={handleNestedInputChange}
              className="w-full h-10 p-2 border border-gray-300 rounded"
            />
          </div>

           {/* Logo */}
          <div className="flex items-center space-x-1">
          <label className="w-40 text-right">Logo</label>
          <input
            type="file"
            name="logo"
            onChange={handleLogoChange('logo')}
            className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
          />
        </div>

        <div className="flex items-center space-x-1">
        <label className="w-40 text-right">Licence Document</label>
        <input
          type="file"
          name="licenceInfo.licenceDocument"
          onChange={(e) => handleLogoChange(e, 'licenceInfo.licenceDocument')}
          className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
        />
      </div>
        </>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4" style={{ color: brandColor }}>
        {[
          {
            label: "ID",
            name: "_id",
            type: "text",
            disabled: true,
          },
          {
            label: "Branch Name",
            name: "name",
          },
          {
            label: "Mnemonic",
            name: "mnemonic",
            disabled: true,
          },
          {
            label: "Brand Color",
            name: "brandColor",
            type: "color",
          },
          {
            label: "Status",
            name: "status",
          },
          {
            label: "Number of Branches",
            name: "noOfBranch",
          },
          {
            label: "Created At",
            name: "createdAt",
            disabled: true,
          },
          {
            label: "Created By",
            name: "createdBy",
            disabled: true,
          },
          {
            label: "Authorized At",
            name: "authorisedAt",
            disabled: true,
          },
          {
            label: "Authorized By",
            name: "authorizedBy",
            disabled: true,
          },
          {
            label: "Updated By",
            name: "updatedBy",
            disabled: true,
          },
          {
            label: "Updated At",
            name: "updatedAt",
            disabled: true,
          },
          {
            label: "Logo",
            name: "logo",
            type: "file",
          },
          {
            label: "Licence Document",
            name: "LicenceDocument",
            type: "file",
          },
        ].map(({ label, name, type = "text", disabled }) => (
          <div key={name} className="flex items-center space-x-1">
            <label className="w-40 text-right">
              {label}
              {requiredFields.includes(name) && <span className="text-red-500">*</span>}
            </label>

            <div className="relative w-full">
              {name === "logo" && BranchData[name] && (
                <div className="mb-2">
                  <img
                    src={BranchData[name]}
                    alt="logo"
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
              {type === "file" ? (
                <input
                  type="file"
                  name={name}
                  onChange={handleLogoChange}
                  className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
                  disabled={!isEditable}
                />
              ) : type === "color" ? (
                <input
                  type="color"
                  name={name}
                  value={BranchData[name] || ""}
                  onChange={handleColorChange}
                  className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
                  disabled={!isEditable || disabled}
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  className="w-full h-10 p-2 border border-gray-300 rounded mt-2"
                  value={BranchData[name] || ""}
                  onChange={handleInputChange}
                  readOnly={!isEditable}
                />
              )}
            </div>
          </div>
        ))}

        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">License Expiration Date</label>
          <input
            type="date"
            name="licenceInfo.licenseExpirationDate"
            value={BranchData.licenceInfo?.licenseExpirationDate ? 
                   BranchData.licenceInfo.licenseExpirationDate.split("T")[0] : ""}
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>

        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">Country</label>
          <input
            type="text"
            name="address.country"
            value={BranchData.address?.country}
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>

        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">State</label>
          <input
            type="text"
            name="address.state"
            value={BranchData.address?.state}
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>

        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">City</label>
          <input
            type="text"
            name="address.city"
            value={BranchData.address?.city }
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>

        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">Street</label>
          <input
            type="text"
            name="address.street"
            value={BranchData.address?.street}
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>



        <div className="flex items-center space-x-1">
          <label className="w-40 text-right">postal Code</label>
          <input
            type="text"
            name="address.postalCode"
            value={BranchData.address?.postalCode}
            onChange={handleNestedInputChange}
            className="w-full h-10 p-2 border border-gray-300 rounded"
            readOnly={!isEditable}
          />
        </div>

      </div>
    );
  };

  return (
    <div>
      {isEditable && !isModalOpen && !isSuccessMessageVisible && (
        <div className="flex space-x-1 mb-4">
          <button
            className="text-white py-1 px-2 rounded relative group"
            style={{ backgroundColor: brandColor }}
            onClick={() => saveChanges(BranchData._id)}
          >
            <FontAwesomeIcon icon={faSave} className="text-2xl" />
            <span className="ml-1">Commit</span>
          </button>
          <button
            className="text-white py-1 px-2 rounded"
            style={{ backgroundColor: brandColor }}
            onClick={handleCancelEdit}
          >
            <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            <span className="ml-2">Back</span>
          </button>
        </div>
      )}


      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-1/4"
            style={{ color: brandColor }}
          >
            <h2 className="text-xl mb-4" style={{ color: brandColor }}>
              Are you sure you want to save changes?
            </h2>
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => {
                  modalAction();
                  handleCancelEdit();
                }}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                Confirm
              </button>
              <button
                onClick={closeModal}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessMessageVisible && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div
            className="bg-white p-6 rounded shadow-lg w-1/4"
            style={{ color: brandColor }}
          >
            <h2 className="text-xl mb-4" style={{ color: brandColor }}>
              Successfully Updated!
            </h2>
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => setIsSuccessMessageVisible(false)}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {renderFields()}
    </div>
  );
};

export default BranchForm;