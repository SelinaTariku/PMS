
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt, faClipboardList, faCommentDots } from "@fortawesome/free-solid-svg-icons";
import fetchPermissions from "../../components/PermissionsAPI";

const Sidebar = ({
  brandColor,
  activeMainItem,
  setActiveMainItem,
  activeSubItem,
  setActiveSubItem,
  isDashboardOpen,
  setIsDashboardOpen,
}) => {
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("id");
    setUserId(storedUserId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const getPermissions = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPermissions.fetchPermissions(userId);
        console.log("API response:", data);
        if (data.error) {
          setError(data.error);
        } else {
          setPermissions(data || []);
          console.log("Permissions fetched successfully:", data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getPermissions();
  }, [userId]);

  const hasPermission = (page) => {
    const permissionExists = Array.isArray(permissions) && permissions.some((perm) => perm.pages === page);
    console.log(`Checking permission for "${page}": ${permissionExists}`);
    return permissionExists;
  };

  const handleMainItemClick = (item) => {
    if (item === "Dashboard") {
      setIsDashboardOpen(!isDashboardOpen);
      setActiveMainItem("Dashboard");
      setActiveSubItem("ItemOverview");
    } else {
      setActiveMainItem(item);
      setActiveSubItem("");
    }
  };

  const handleSubItemClick = (subItem) => {
    setActiveSubItem(subItem);
    if (subItem === "ItemOverview") {
      setActiveMainItem("Dashboard");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <aside className="bg-white w-full md:w-64 p-4 border-r border-gray-200">
      <nav>
        <ul>
          {hasPermission("ItemOverview") && (
            <li className="mb-4">
              <a
                href="#"
                onClick={() => handleMainItemClick("Dashboard")}
                className={`flex items-center font-bold h-9 px-2 ${
                  activeMainItem === "Dashboard" ? "text-white" : ""
                }`}
                style={
                  activeMainItem === "Dashboard"
                    ? { backgroundColor: brandColor, color: "white" }
                    : { color: brandColor, backgroundColor: "white" }
                }
                onMouseEnter={(e) => {
                  if (activeMainItem !== "Dashboard") {
                    e.currentTarget.style.backgroundColor = `${brandColor}80`; // Lighter shade for hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMainItem !== "Dashboard") {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <FontAwesomeIcon icon={faTachometerAlt} className="mr-3" />
                Dashboard
              </a>
              {isDashboardOpen && (
                <ul className="ml-6 mt-2">
                  <li className="mb-2">
                    <a
                      href="#"
                      onClick={() => handleSubItemClick("ItemOverview")}
                      className={`flex items-center h-9 px-2 ${
                        activeSubItem === "ItemOverview" ? "text-white" : ""
                      }`}
                      style={
                        activeSubItem === "ItemOverview"
                          ? { backgroundColor: brandColor, color: "white" }
                          : { color: brandColor, backgroundColor: "white" }
                      }
                      onMouseEnter={(e) => {
                        if (activeSubItem !== "ItemOverview") {
                          e.currentTarget.style.backgroundColor = `${brandColor}80`; // Lighter shade for hover
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeSubItem !== "ItemOverview") {
                          e.currentTarget.style.backgroundColor = "white";
                        }
                      }}
                    >
                      <FontAwesomeIcon icon={faClipboardList} className="mr-3" />
                      Item Overview
                    </a>
                  </li>
                </ul>
              )}
            </li>
          )}

          {hasPermission("Items") && (
            <li className="mb-4">
              <a
                href="#"
                onClick={() => handleMainItemClick("Items")}
                className={`flex items-center h-9 px-2 ${
                  activeMainItem === "Items" ? "text-white" : ""
                }`}
                style={
                  activeMainItem === "Items"
                    ? { backgroundColor: brandColor, color: "white" }
                    : { color: brandColor, backgroundColor: "white" }
                }
                onMouseEnter={(e) => {
                  if (activeMainItem !== "Items") {
                    e.currentTarget.style.backgroundColor = `${brandColor}80`; // Lighter shade for hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMainItem !== "Items") {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-3" />
                Items
              </a>
            </li>
          )}

          {hasPermission("FeedbackSuggestions") && (
            <li className="mb-4">
              <a
                href="#"
                onClick={() => handleMainItemClick("FeedbackSuggestions")}
                className={`flex items-center h-9 px-2 ${
                  activeMainItem === "FeedbackSuggestions" ? "text-white" : ""
                }`}
                style={
                  activeMainItem === "FeedbackSuggestions"
                    ? { backgroundColor: brandColor, color: "white" }
                    : { color: brandColor, backgroundColor: "white" }
                }
                onMouseEnter={(e) => {
                  if (activeMainItem !== "FeedbackSuggestions") {
                    e.currentTarget.style.backgroundColor = `${brandColor}80`; // Lighter shade for hover
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMainItem !== "FeedbackSuggestions") {
                    e.currentTarget.style.backgroundColor = "white";
                  }
                }}
              >
                <FontAwesomeIcon icon={faCommentDots} className="mr-3" />
                Feedback Suggestions
              </a>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
