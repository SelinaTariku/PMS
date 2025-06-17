import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCaretUp, faCaretDown, faEye, faSearch, faFileExport, faPlus } from '@fortawesome/free-solid-svg-icons';
import PharmacyAPI from "../API/pharmacyApi";
import UpdatePharmacyForm from './updatePharmacyForBranchManager'; 
import ViewPharmacyDetail from './viewPharmacy';
import CreatePharmacy from './createPharmacy'; 
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';

const PharmacyManagement = () => {
  // Initial state setup
  const initialPharmacyData = () => ({
    name: '',
    logo: '',
    brandColor: '#000000',
    street: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    licenseNumber: '',
    licenceDocument: '',
    licenseExpirationDate: '',
    status: 'Pending',
    authorizedBy: '',
    mnemonic: '',
    CURR: 0,
    noOfBranch: 1,
  });

  // State management
  const [pharmacyData, setPharmacyData] = useState(initialPharmacyData());
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchValue, setSearchValue] = useState('');
  const [selectedSearchField, setSelectedSearchField] = useState('name');
  const brandColor = localStorage.getItem('brandColor') || '#1E467A';
  const [errors, setErrors] = useState({});
  const itemsPerPage = 5;
  const [pharmacy, setpharmacy]=useState({});
  const pharmacyId= localStorage.getItem('pharmacy')

  // Searchable fields configuration
  const searchFields = [
    { value: 'name', label: 'Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'status', label: 'Status' },
    { value: 'mnemonic', label: 'Mnemonic' },
    { value: 'email', label: 'Email' }
  ];


  // Data fetching
  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        const data = await PharmacyAPI.fetchLiveById(pharmacyId);
        setpharmacy(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, []);


  const handleEditPharmacyData = (pharmacy) => {
    setPharmacyData(pharmacy);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
  };

  const handleViewPharmacyData = (pharmacy) => {
    setPharmacyData(pharmacy);
    setIsViewing(true);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleCancelView = () => {
    setIsViewing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleCreateNewPharmacy = () => {
    setPharmacyData(initialPharmacyData());
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    );
  }

  // Main render
  return (
    <div className="container mx-auto px-4 py-6">
      {isViewing ? (
        <ViewPharmacyDetail 
          pharmacyData={pharmacyData} 
          brandColor={brandColor} 
          handleCancel={handleCancelView} 
        />
      ) : isEditing ? (
        <UpdatePharmacyForm 
          pharmacyData={pharmacyData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={handleCancelEdit} 
          handleCancel={handleCancelEdit} 
        />
      ) : isCreating ? (
        <CreatePharmacy 
          pharmacyData={pharmacyData} 
          setErrors={setErrors} 
          errors={errors} 
          brandColor={brandColor} 
          onCommit={() => setIsCreating(false)} 
          handleCancel={() => setIsCreating(false)} 
        />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold " style={{color:brandColor}}>Pharmacy Management</h1>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'Mnemonic', 'Phone', 'Email', 'Status', 'Created At'].map((field) => (
                      <th
                        key={field}
                        className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        style={{ color: brandColor }}
                      >
                        <div className="flex items-center">
                          {field}
                          {sortField === field.toLowerCase().replace(' ', '') && (
                            <FontAwesomeIcon 
                              icon={sortDirection === "asc" ? faCaretUp : faCaretDown} 
                              className="ml-1" 
                              style={{ color: brandColor }} 
                            />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                      <tr key={pharmacy._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pharmacy.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.mnemonic}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.phone}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {pharmacy.email}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${pharmacy.status === 'Active' ? 'bg-green-100 text-green-800' : 
                              pharmacy.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {pharmacy.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(pharmacy.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEditPharmacyData(pharmacy)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button
                              onClick={() => handleViewPharmacyData(pharmacy)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </div>
                        </td>
                      </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PharmacyManagement;