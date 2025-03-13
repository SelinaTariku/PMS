
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEdit, faTrash, faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const PermissionMenu = ({ brandColor }) => {
  const [userPermissions, setUserPermissions] = useState({});
  const [availablePages, setAvailablePages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddPermission, setShowAddPermission] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newPage, setNewPage] = useState("");
  const [newAccess, setNewAccess] = useState("read");
  const [editingPermission, setEditingPermission] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});
  const role = localStorage.getItem("role");
  const pharmacyId = localStorage.getItem("pharmacy");

  useEffect(() => {
    const fetchAvailablePages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/pages/getPagesByRole/${role}`
        );
        setAvailablePages(response.data || []);
      } catch (err) {
        setError("Failed to fetch pages");
      } finally {
        setLoading(false);
      }
    };
    fetchAvailablePages();
  }, [role]);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/users/getAllUSerByPharmacy/${pharmacyId}`
        );
        const filteredUsers = response.data.map((user) => ({
          _id: user._id,
          userName: user.userName,
          signOnName: user.signOnName,
          role: user.role,
          branches: user.branches,
          pharmacy: user.pharmacy,
          status: user.status,
        }));

        setUsers(filteredUsers);

        const permissionsResponse = await Promise.all(
          filteredUsers.map(async (user) => {
            try {
              const response = await axios.get(
                `http://localhost:5000/Permissions/getUserPermissions/${user._id}`
              );
              return response.data;
            } catch (err) {
              return [];
            }
          })
        );

        const permissionsMap = {};
        permissionsResponse.forEach((permissions, index) => {
          permissionsMap[filteredUsers[index]._id] = permissions;
        });
        setUserPermissions(permissionsMap);
      } catch (err) {
        setError("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    if (pharmacyId) {
      fetchUsers();
    }
  }, [pharmacyId]);

  const handleAddPermission = () => {
    setShowAddPermission(true);
  };

  const handleGrantPermission = async () => {
    if (!newUserId || !newPage) {
      alert("Please select both a user and a page.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/permissions/assignPermissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: newUserId,
            "permissions.page": newPage,
            "permissions.access": newAccess,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      alert("Permission granted successfully!");
      setShowAddPermission(false);
      setUserPermissions((prevPermissions) => ({
        ...prevPermissions,
        [newUserId]: [
          ...(prevPermissions[newUserId] || []),
          { pages: newPage, access: newAccess, _id: Math.random().toString() },
        ],
      }));
    } catch (err) {
      alert("Failed to grant permission: " + err.message);
    }
  };

  const handleEditPermission = async (userId, permissionId, updatedAccess) => {
    try {
      const response = await fetch(
        `http://localhost:5000/permissions/updatePermission/${permissionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access: updatedAccess }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update permission");
      }

      alert("Permission updated successfully!");
      setUserPermissions((prevPermissions) => {
        const updatedPermissions = prevPermissions[userId].map((permission) =>
          permission._id === permissionId
            ? { ...permission, access: updatedAccess }
            : permission
        );
        return {
          ...prevPermissions,
          [userId]: updatedPermissions,
        };
      });
      setEditingPermission(null);
    } catch (err) {
      alert("Failed to update permission");
    }
  };

  const handleDeletePermission = async (userId, permissionId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/permissions/deletePermission/${permissionId}`
      );
      if (!response.ok) {
        throw new Error("Failed to delete permission");
      }
      alert("Permission deleted successfully!");
      setUserPermissions((prevPermissions) => {
        const updatedPermissions = prevPermissions[userId].filter(
          (permission) => permission._id !== permissionId
        );
        return {
          ...prevPermissions,
          [userId]: updatedPermissions,
        };
      });
    } catch (err) {
      alert("Failed to delete permission");
    }
  };

  const toggleUserPermissions = (userId) => {
    setExpandedUsers((prevExpandedUsers) => ({
      ...prevExpandedUsers,
      [userId]: !prevExpandedUsers[userId],
    }));
  };

  const handleEditButtonClick = (permission) => {
    setEditingPermission(permission);
    setNewAccess(permission.access);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading pages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold" style={{ color: brandColor }}>
            Permission Menu
          </h1>
          <button
            onClick={handleAddPermission}
            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add Permission
          </button>
        </div>

        {showAddPermission && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">Grant New Permission</h2>
            <div className="mb-4">
              <label className="block mb-2">Select User</label>
              <select
                value={newUserId}
                onChange={(e) => setNewUserId(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">Select a user</option>
                {users.length > 0 ? (
                  users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.userName} ({user.signOnName}) - Role: {user.role} -
                      Status: {user.status}
                    </option>
                  ))
                ) : (
                  <option value="">No users found</option>
                )}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Select Page</label>
              <select
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">Select a page</option>
                {availablePages.map((page) => (
                  <option key={page._id} value={page._id}>
                    {page.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2">Select Access</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="read"
                    checked={newAccess === "read"}
                    onChange={() => setNewAccess("read")}
                    className="mr-2"
                  />
                  Read Only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="write"
                    checked={newAccess === "write"}
                    onChange={() => setNewAccess("write")}
                    className="mr-2"
                  />
                  Write
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="read-write"
                    checked={newAccess === "read-write"}
                    onChange={() => setNewAccess("read-write")}
                    className="mr-2"
                  />
                  Read/Write
                </label>
              </div>
            </div>
            <button
              onClick={handleGrantPermission}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Grant Permission
            </button>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: brandColor }}>
            Current Permissions
          </h2>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user._id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center" >
                  <div>
                    <h3 className="text-lg font-semibold" style={{color:brandColor}}>{user.userName}</h3>
                    <p className="text-sm" style={{color:brandColor}}>ID: {user._id}</p>
                  </div>
                  <button
                    onClick={() => toggleUserPermissions(user._id)}
                    className="text-gray-500 hover:text-gray-700"
                    style={{color:brandColor}}
                  >
                    <FontAwesomeIcon
                      icon={expandedUsers[user._id] ? faChevronUp : faChevronDown}
                    />
                  </button>
                </div>
                {expandedUsers[user._id] && (
                  <div className="mt-2" style={{color:brandColor}}> 
                    <h4 className="font-semibold" style={{color:brandColor}}>Permissions:</h4>
                    <div className="space-y-2" style={{color:brandColor}}>
                      {userPermissions[user._id] && userPermissions[user._id].length > 0 ? (
                        userPermissions[user._id].map((permission) => (
                          <div
                            key={permission._id}
                            className="flex justify-between items-center border-b py-2"
                            style={{color:brandColor}}
                          >
                            <div className="flex flex-col" style={{color:brandColor}}>
                              <span>{permission.pages}</span>
                              <span className="text-sm " style={{color:brandColor}}>
                                {permission.access}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditButtonClick(permission)}
                                className="text-blue-500 "
                                style={{background:brandColor}}
                              >
                                <FontAwesomeIcon icon={faEdit} /> Edit
                              </button>
                              <button
                                onClick={() =>
                                  handleDeletePermission(user._id, permission._id)
                                }
                                className="text-red-500 hover:text-red-700"
                                style={{background:brandColor}}
                              >
                                <FontAwesomeIcon icon={faTrash} /> Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div>No permissions found for this user</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {editingPermission && (
          <div className="bg-gray-50 p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-xl font-semibold mb-4">Edit Permission</h2>
            <div className="mb-4">
              <label className="block mb-2">Select Access</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="read"
                    checked={newAccess === "read"}
                    onChange={() =>
                      setNewAccess("read")
                    }
                    className="mr-2"
                  />
                  Read Only
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="write"
                    checked={newAccess === "write"}
                    onChange={() =>
                      setNewAccess("write")
                    }
                    className="mr-2"
                  />
                  Write
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="access"
                    value="read-write"
                    checked={newAccess === "read-write"}
                    onChange={() =>
                      setNewAccess("read-write")
                    }
                    className="mr-2"
                  />
                  Read/Write
                </label>
              </div>
            </div>
            <button
              onClick={() =>
                handleEditPermission(
                  editingPermission.userId,
                  editingPermission._id,
                  newAccess
                )
              }
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              Update Permission
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionMenu;
