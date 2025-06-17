import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faCaretUp, faCaretDown, faEye, faSearch, faFileExport, faPlus } from '@fortawesome/free-solid-svg-icons';
import userAPI from "../API/userApi";
import UpdatePharmacyForm from './updateUser';
import ViewPharmacyDetail from './viewUser';
import CreateUser from './createUser';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';
import axios from "axios";
import Modal from '../Modal';

const UserManagement = () => {
  const initialUserData = () => ({
    fullName: '',
    email: '',
    role: '',
    street: '',
    city: '',
    state: '',
    phone: '',
    branches: '',
    pharmacy: '',
    status: '',
    lock: '',
    lastSignOn: '',
    lockedAt: '',
    CURR: 0,
  });

  // State management
  const [userData, setUserData] = useState(initialUserData());
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [roleName, setRoleName] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("email");
  const [sortDirection, setSortDirection] = useState("asc");
  const [searchValue, setSearchValue] = useState('');
  const [searchField, setSearchField] = useState('email'); // Default search field
  const brandColor = localStorage.getItem('brandColor') || '#1E467A';
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Searchable fields
  const searchableFields = [
    { value: 'email', label: 'Email' },
    { value: 'fullName', label: 'Name' },
    { value: 'phone', label: 'Phone' },
    { value: 'status', label: 'Status' },
    { value: 'role', label: 'Role' }
  ];

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  useEffect(() => {
    const fetchRole = async () => {
      setLoading(true);
      try {
        const role = localStorage.getItem('role');
        const response = await axios.get(`http://localhost:5000/role/getRoleById/${role}`);
        const roleName = response.data.name;
        setRoleName(roleName);
        setIsAdmin(roleName === 'Admin');
      } catch (error) {
        console.error("Error fetching role data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  useEffect(() => {
    const fetchRecord = async () => {
      setLoading(true);
      try {
        let data;
        if (isAdmin) {
          data = await userAPI.fetchAllLiveByRole();
        } else {
          const pharmacyId = localStorage.getItem('pharmacy');
          data = await userAPI.fetchAllLiveByPharmacy(pharmacyId);
        }

        if (data && data.length) {
          const usersWithRoles = await Promise.all(data.map(async (user) => {
            const roleResponse = await axios.get(`http://localhost:5000/role/getRoleById/${user.role}`);
            return {
              ...user,
              role: roleResponse.data.name
            };
          }));

          setSearchResults(usersWithRoles);
          setFilteredResults(usersWithRoles);
        } else {
          setSearchResults([]);
          setFilteredResults([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [isAdmin]);

  useEffect(() => {
    if (searchValue) {
      const filtered = searchResults.filter((user) => {
        const fieldValue = user[searchField]?.toString().toLowerCase() || '';
        return fieldValue.includes(searchValue.toLowerCase());
      });
      setFilteredResults(filtered);
    } else {
      setFilteredResults(searchResults);
    }
  }, [searchValue, searchResults, searchField]);

  const handleSearchInputChange = (e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchFieldChange = (e) => {
    setSearchField(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);
    const sortedResults = [...filteredResults].sort((a, b) => {
      if (direction === "asc") {
        return a[field] > b[field] ? 1 : -1;
      } else {
        return a[field] < b[field] ? 1 : -1;
      }
    });
    setFilteredResults(sortedResults);
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    return filteredResults.map(user => ({
      Email: user.email,
      Name: user.fullName,
      Phone: user.phone,
      Status: user.status,
      Role: user.role,
      'Created At': new Date(user.createdAt).toLocaleString()
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('User Management Report', 14, 15);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Email", "Name", "Phone", "Status", "Role", "Created At"];
    const tableRows = filteredResults.map(user => [
      user.email,
      user.fullName,
      user.phone,
      user.status,
      user.role,
      new Date(user.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        halign: 'left',
      },
      headStyles: {
        fillColor: [brandColor],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      margin: { top: 30 }
    });

    doc.save("user_report.pdf");
  };

  const handleEditUserData = (user) => {
    const loggedInUserId = localStorage.getItem('id');
    if (loggedInUserId === user._id) {
      setModalMessage("You cannot edit your own account.");
      setIsModalOpen(true);
      return;
    }
    setUserData(user);
    setIsEditing(true);
    setIsViewing(false);
    setIsCreating(false);
  };

  const handleViewUserData = (user) => {
    setUserData(user);
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

  const handleCreateNewUser = () => {
    setUserData(initialUserData());
    setIsCreating(true);
    setIsEditing(false);
    setIsViewing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: brandColor }}></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {isViewing ? (
        <ViewPharmacyDetail
          userData={userData}
          brandColor={brandColor}
          handleCancel={handleCancelView}
        />
      ) : isEditing ? (
        <UpdatePharmacyForm
          userData={userData}
          setErrors={setErrors}
          errors={errors}
          brandColor={brandColor}
          isAdmin={isAdmin}
          onCommit={handleCancelEdit}
          handleCancel={handleCancelEdit}
        />
      ) : isCreating ? (
        <CreateUser
          userData={userData}
          setErrors={setErrors}
          errors={errors}
          brandColor={brandColor}
          isAdmin={isAdmin}
          onCommit={() => setIsCreating(false)}
          handleCancel={() => setIsCreating(false)}
        />
      ) : (
        <>
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-1 mb-3">
            <h1 className="text-2xl font-bold " style={{ color: brandColor }} >User Management</h1>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              {/* Search Section */}
              <div className="relative flex-grow md:w-64">
                <div className="flex rounded-md shadow-sm">
                  <select
                    value={searchField}
                    onChange={handleSearchFieldChange}
                    className="inline-flex items-center px-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm"
                  >
                    {searchableFields.map(field => (
                      <option key={field.value} value={field.value}>{field.label}</option>
                    ))}
                  </select>
                  <div className="relative flex-grow">
                    <input
                      type="search"
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Search by ${searchableFields.find(f => f.value === searchField)?.label || 'field'}...`}
                      value={searchValue}
                      onChange={handleSearchInputChange}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleCreateNewUser}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: brandColor }}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  New User
                </button>

                <div className="relative group">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FontAwesomeIcon icon={faFileExport} className="mr-2" />
                    Export
                  </button>
                  <div className="absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block z-10">
                    <div className="py-1">
                      <CSVLink
                        data={exportToCSV()}
                        filename="user_data.csv"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export to CSV
                      </CSVLink>
                      <button
                        onClick={exportToPDF}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export to PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Email', 'Name', 'Phone', 'Status', 'Role', 'Created At'].map((field) => (
                      <th
                        key={field}
                        onClick={() => handleSort(field.toLowerCase().replace(' ', ''))}
                        className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider" style={{ color: brandColor }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length > 0 ? (
                    currentItems.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {user.fullName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {user.phone}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {user.role}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-4">
                            <button
                              onClick={() => handleEditUserData(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} />
                            </button>
                            <button
                              onClick={() => handleViewUserData(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredResults.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredResults.length)}</span> of{' '}
                      <span className="font-medium">{filteredResults.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Previous</span>
                        Previous
                      </button>

                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = currentPage <= 3 ? i + 1 :
                          currentPage >= totalPages - 2 ? totalPages - 4 + i :
                            currentPage - 2 + i;
                        if (pageNum > totalPages || pageNum < 1) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum ?
                              `z-10 bg-blue-50 border-blue-500 text-blue-600` :
                              'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        <span className="sr-only">Next</span>
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal for edit restriction */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            message={modalMessage}
            brandColor={brandColor}
          />
        </>
      )}
    </div>
  );
};

export default UserManagement;