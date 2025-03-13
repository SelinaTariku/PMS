import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes, faImage } from "@fortawesome/free-solid-svg-icons";
import userAPI from "./API";

const requiredFields = [
  "id",
  "userName",
  "signOnName",
  "role",
  "address.street",
  "address.city",
  "address.state",
  "address.postalCode",
  "address.country",
  "contactInfo.phone",
  "contactInfo.email",
  "branches",
  "pharmacy",
  "status",
  "lock",
  "createdBy",
  "createdAt",
  "profileStartDate",
  "attempts",
  "authorisedBy",
  "authorisedAt",
  "CURR",
];

const Form = ({
  RecordData,
  handleInputChange,
  handleNestedInputChange,
  handleSaveChanges,
  handleCancelEdit,
  isEditable,
  handleFileChange,
  brandColor,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);

  const saveChanges = async (id) => {
    setIsModalOpen(true);
    setModalAction(() => async () => {
      try {
        const updatedData = {
          ...RecordData,
          updatedBy: localStorage.getItem("id"),
        };
        const data = await userAPI.updatePharmacyData(updatedData, id);

        if (!data.ok) {
          throw new Error(`Failed to save User data: ${data.status}`);
        }
        const result = await data.json();
        setIsSuccessMessageVisible(true);
        setIsModalOpen(false);
        handleSaveChanges();
      } catch (error) {
        console.error("Error saving User data:", error);
        setIsModalOpen(false);
      }
    });
  };

  const closeModal = () => setIsModalOpen(false);

  const handleDateChange = (e) => {
    const updatedData = { ...RecordData };
    if (!updatedData.licenceInfo) {
      updatedData.licenceInfo = {};
    }
    updatedData.licenceInfo.licenseExpirationDate = e.target.value;
    handleInputChange(e, updatedData);
  };

  return (
    <div>
      {isEditable && !isModalOpen && !isSuccessMessageVisible && (
        <div className="flex space-x-1 mb-4">
          <button
            className="text-white py-1 px-2 rounded relative group"
            style={{ backgroundColor: brandColor }}
            onClick={() => saveChanges(RecordData._id)}
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
            <h2 className="text-xl mb-4">
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
                className="bg-red-500 text-white py-1 px-4 rounded"
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
            <h2 className="text-xl mb-4">Successfully Updated!</h2>
            <div className="flex justify-center space-x-1">
              <button
                onClick={() => setIsSuccessMessageVisible(false)}
                className="text-white py-1 px-4 rounded"
                style={{ backgroundColor: brandColor }}
              >
                ok
              </button>
            </div>
          </div>
        </div>
      )}

<div
  className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4"
  style={{ color: brandColor }}
>
  {[{
      label: "ID",
      name: "_id",
      type: "text",
      disabled: true,
    },
    { label: "User Name", name: "userName" },
    { label: "Signon Name", name: "signOnName", readOnly: true, disabled: true },
    { label: "Role", name: "role" },
    { label: "Status", name: "status" },
    { label: "Branches", name: "branches", readOnly: true, disabled: false },
    { label: "Pharmacy", name: "pharmacy", readOnly: true, disabled: false },
    { label: "Created At", name: "createdAt", disabled: true },
    { label: "CURR", name: "CURR", readOnly: true, disabled: true },
    { label: "Created By", name: "createdBy", readOnly: true, disabled: true },
    { label: "Authorized At", name: "authorisedAt", readOnly: true, disabled: true },
    { label: "Authorized By", name: "authorizedBy", readOnly: true, disabled: true },
    { label: "Updated By", name: "updatedBy", readOnly: true, disabled: true },
    { label: "Updated At", name: "updatedAt", disabled: true },
    { label: "Lock", name: "lock", type: "boolean" },
    { label: "Profile Start Date", name: "profileStartDate", disabled: true },
    { label: "Attempts", name: "attempts", disabled: true }
  ].map(({ label, name, readOnly, disabled, type = "text" }) => (
    <div key={name} className="flex items-center space-x-1">
      <label
        className="w-40 text-right"
        style={{
          color: brandColor,
        }}
      >
        {label}
        {requiredFields.includes(name) && (
          <span className="text-red-500">*</span>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={RecordData[name] || ""}  
        onChange={handleInputChange}  
        className="w-full h-10 p-2 border border-gray-300 rounded"
        readOnly={readOnly}  
        disabled={disabled}  
      />
    </div>
  ))}


  <div className="flex items-center space-x-1">
    <label className="w-40 text-right">Street</label>
    <input
      type="text"
      name="address.street"
      value={RecordData.address?.street || ""}
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
      value={RecordData.address?.city || ""}
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
      value={RecordData.address?.state || ""}
      onChange={handleNestedInputChange}
      className="w-full h-10 p-2 border border-gray-300 rounded"
      readOnly={!isEditable}
    />
  </div>
  <div className="flex items-center space-x-1">
    <label className="w-40 text-right">Postal Code</label>
    <input
      type="text"
      name="address.postalCode"
      value={RecordData.address?.postalCode || ""}
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
      value={RecordData.address?.country || ""}
      onChange={handleNestedInputChange}
      className="w-full h-10 p-2 border border-gray-300 rounded"
      readOnly={!isEditable}
    />
  </div>

  {/* Contact Information */}
  <div className="flex items-center space-x-1">
    <label className="w-40 text-right">Phone</label>
    <input
      type="text"
      name="contactInfo.phone"
      value={RecordData.contactInfo?.phone || ""}
      onChange={handleNestedInputChange}
      className="w-full h-10 p-2 border border-gray-300 rounded"
      readOnly={!isEditable}
    />
  </div>
  <div className="flex items-center space-x-1">
    <label className="w-40 text-right">Email</label>
    <input
      type="email"
      name="contactInfo.email"
      value={RecordData.contactInfo?.email || ""}
      onChange={handleNestedInputChange}
      className="w-full h-10 p-2 border border-gray-300 rounded"
      readOnly={!isEditable}
    />
  </div>
</div>
    </div>
  );
};

export default Form;
