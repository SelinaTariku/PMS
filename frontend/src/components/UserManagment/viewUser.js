import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaArrowLeft } from "react-icons/fa";
import axios from "axios";

const ViewUserDetail = ({ userData, brandColor, handleCancel }) => {
  const [activeTab, setActiveTab] = useState('General Information');
  const [roleName, setRoleName] = useState(null);
  const [createdBy, setcreatedBy] = useState(null);
  const [pharmacyId, setpharmacyId] = useState(null);
  const [branchName, setbranchName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/role/getRoleById/${userData.role}`);
        setRoleName(response.data.name);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching role data:", error);
        setLoading(false);
      }
    };

    fetchRole();
  }, [userData.role]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/users/getUserById/${userData.createdBy}`);
        setcreatedBy(response.data.email);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching role data:", error);
        setLoading(false);
      }
    };

    fetchRole();
  }, [userData.role]);


  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${userData.pharmacy}`);
        setpharmacyId(response.data.mnemonic);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching role data:", error);
        setLoading(false);
      }
    };

    fetchRole();
  }, [userData.role]);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/pharmacies/getPharmacyById/${userData.pharmacy}`);
        setbranchName(response.data.mnemonic);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching role data:", error);
        setLoading(false);
      }
    };

    fetchRole();
  }, [userData.role]);

  const tabs = [
    { label: 'General Information', content: generalInfoContent() },
    { label: 'Address', content: addressContent() },
    { label: 'Account Information', content: accountInfoContent() },
  ];

  function generalInfoContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="ID" value={userData._id} />
          <DetailRow label="Full Name" value={userData.fullName} />
          <DetailRow label="Email" value={userData.email} />
          <DetailRow label="Phone" value={userData.phone} />
          <DetailRow
            label="Status"
            value={
              <span className={userData.status === 'Active' ? 'text-green-500' : 'text-red-500'}>
                {userData.status}
              </span>
            }
          />
        </tbody>
      </table>
    );
  }

  function addressContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="State" value={`${userData.state}`} />
          <DetailRow label="City" value={`${userData.city}`} />
          <DetailRow label="Street" value={`${userData.street}`} />
        </tbody>
      </table>
    );
  }

  function accountInfoContent() {
    return (
      <table className="min-w-full bg-white">
        <tbody>
          <DetailRow label="Role" value={loading ? 'Loading...' : roleName || 'N/A'} />
          <DetailRow label="Created At" value={new Date(userData.createdAt).toLocaleDateString()} />
          <DetailRow label="created By" value={loading ? 'Loading...' : createdBy || 'N/A'} />

          <DetailRow label="Pharmacy" value={loading ? 'Loading...' : pharmacyId || 'N/A'} />

          <DetailRow label="Branch" value={loading ? 'Loading...' : branchName || 'N/A'} />
        </tbody>
      </table>
    );
  }

  return (
    <div className="p-2 bg-white rounded-lg shadow-lg max-h-screen overflow-hidden">
      <div className="flex items-center mb-2">
        <button
          className="p-2 rounded-full shadow hover:opacity-90 transition"
          style={{ backgroundColor: brandColor }}
          onClick={handleCancel}
          aria-label="Go back"
        >
          <FaArrowLeft className="text-white" />
        </button>

        <h2 className="text-2xl font-bold mb-2 ml-10" style={{ color: brandColor }}>User Details</h2>
      </div>
      <div className="mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`px-4 py-1 mr-2 rounded transition duration-300 ${activeTab === tab.label
              ? `bg-[${brandColor}] text-white`
              : 'bg-gray-300 text-black hover:bg-gray-400'
              }`}
            onClick={() => setActiveTab(tab.label)}
            style={{
              backgroundColor: activeTab === tab.label ? brandColor : 'lightgray',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {tabs.find(tab => tab.label === activeTab)?.content}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <tr className="border-b border-gray-300">
    <td className="px-1 py-2 font-semibold text-gray-700">{label}:</td>
    <td className="px-4 py-2 text-gray-800 text-left">{value}</td>
  </tr>
);

export default ViewUserDetail;
