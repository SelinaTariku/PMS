import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faClipboardList, faCogs, faUser, faArrowLeft, faArrowRight, faClinicMedical, faKitMedical, faLockOpen, faTimesCircle, faClockFour, faUnlock, faKey } from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const brandColor = localStorage.getItem("brandColor") || "#1E467A";
  const location = useLocation();
  const [filteredMenu, setFilteredMenu] = useState([]);

  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const PermissionResponse = await axios.get(`http://localhost:5000/role/getPermissionsByRoleName/${role}`);
        localStorage.setItem("UserPermission", JSON.stringify(PermissionResponse.data.pageNames));
        console.log("Admin User Permission", localStorage.getItem('UserPermission'));

        const userPermissions = JSON.parse(localStorage.getItem("UserPermission")) || [];
        const filtered = menu.map(menuItem => ({
          ...menuItem,
          subPages: menuItem.subPages ? menuItem.subPages.filter(subPage => userPermissions.includes(subPage.id)) : null
        })).filter(menuItem => !menuItem.subPages || menuItem.subPages.length > 0);
        setFilteredMenu(filtered);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [role]);

  const menu = [
    {
      id: "Dashboard",
      name: "Dashboard",
      icon: faChartLine,
      subPages: [
        { id: "PharmacyOverview", name: "Pharmacy Overview", path: "/PharmacSphere/Portal/Dashboard/PharmacyOverview", icon: faClipboardList },
        { id: "BranchOverview", name: "Branch Overview", path: "/PharmacSphere/Portal/Dashboard/BranchOverview", icon: faClipboardList },
      ],
    },
    {
      id: "PharmacyManagement",
      name: "Pharmacy Management",
      icon: faClinicMedical,
      subPages: [
        { id: "ManagePharmacy", name: "Management Pharmacy", path: "/PharmacSphere/Portal/PharmacyManagement/ManagePharmacy", icon: faKitMedical },
        { id: "UnautorisedPharmacy", name: "Unautorised Pharmacy", path: "/PharmacSphere/Portal/PharmacyManagement/UnautorisedPharmacy", icon: faClockFour },
        { id: "RejectedPharmacy", name: "Rejected Pharmacy", path: "/PharmacSphere/Portal/PharmacyManagement/RejectedPharmacy", icon: faTimesCircle },
        { id: "AutorisePharmacy", name: "Autorise Pharmacy", path: "/PharmacSphere/Portal/PharmacyManagement/AutorisePharmacy", icon: faLockOpen },
      ],
    },
    {
      id: "AccountSetting",
      name: "Account Settings",
      icon: faCogs,
      subPages: [
        { id: "ManageUser", name: "User Management", path: "/PharmacSphere/Portal/AccountSetting/ManageUser", icon: faUser },
        { id: "ManagePermission", name: "Manage Permission", path: "/PharmacSphere/Portal/AccountSetting/ManagePermission", icon: faKey },
        { id: "ManageRole", name: "Manage Role", path: "/PharmacSphere/Portal/AccountSetting/ManageRole", icon: faUnlock },
      ],
    },
  ];

  useEffect(() => {
    const currentPath = location.pathname;
    const foundMenu = filteredMenu.find(item => item.path === currentPath || item.subPages?.some(sub => sub.path === currentPath));

    if (foundMenu) {
      if (foundMenu.subPages) {
        setSelectedMenu(null);
      } else {
        setSelectedMenu(foundMenu.id);
      }
    } else {
      setSelectedMenu(null);
    }
  }, [location, filteredMenu]);

  const handleSubMenuToggle = (menuId) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };

  return (
    <aside
      className={`bg-white border-r transition-all duration-300 ${isCollapsed ? "w-7" : "w-64"}`}
      style={{ transition: "width 0.3s ease" }}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-2 pl-7">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="rounded-full p-2"
            style={{ background: brandColor }}
          >
            <FontAwesomeIcon icon={isCollapsed ? faArrowRight : faArrowLeft} style={{ color: "white" }} />
          </button>
        </div>
        <nav className="flex-1">
          <ul>
            {filteredMenu.map((menuItem) => (
              <li className="mb-4" key={menuItem.id}>
                {menuItem.subPages ? (
                  <>
                    <span
                      className="flex items-center h-9 px-2 cursor-pointer"
                      style={{
                        backgroundColor: selectedMenu === menuItem.id ? brandColor : 'transparent',
                        color: selectedMenu === menuItem.id ? 'white' : brandColor,
                      }}
                      onClick={() => {
                        handleSubMenuToggle(menuItem.id);
                        setSelectedMenu(menuItem.id === selectedMenu ? null : menuItem.id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={menuItem.icon}
                        className={`mr-3 ${isCollapsed ? 'opacity-0' : ''}`}
                        style={{ color: selectedMenu === menuItem.id ? 'white' : brandColor }}
                      />
                      <span
                        style={{
                          fontWeight: selectedMenu === menuItem.id ? 'bold' : 'normal',
                          visibility: isCollapsed ? 'hidden' : 'visible',
                        }}
                      >
                        {menuItem.name}
                      </span>
                    </span>
                    <ul className={`ml-6 mt-2 ${openSubMenu === menuItem.id ? "" : "hidden"}`}>
                      {menuItem.subPages.map((subPage) => (
                        <li className="mb-2" key={subPage.id}>
                          <Link
                            to={subPage.path}
                            className="flex items-center h-9 px-2"
                            style={{
                              backgroundColor: location.pathname === subPage.path ? brandColor : 'transparent',
                              color: location.pathname === subPage.path ? 'white' : brandColor,
                            }}
                            onClick={() => setSelectedMenu(menuItem.id)}
                          >
                            <FontAwesomeIcon
                              icon={subPage.icon}
                              className={`mr-3 ${isCollapsed ? 'opacity-0' : ''}`}
                              style={{
                                color: location.pathname === subPage.path ? 'white' : brandColor,
                              }}
                            />
                            <span
                              style={{
                                visibility: isCollapsed ? 'hidden' : 'visible',
                              }}
                            >
                              {subPage.name}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    to={menuItem.path}
                    className="flex items-center h-9 px-2"
                    style={{
                      backgroundColor: selectedMenu === menuItem.id ? brandColor : 'transparent',
                      color: selectedMenu === menuItem.id ? 'white' : brandColor,
                    }}
                    onClick={() => setSelectedMenu(menuItem.id)}
                  >
                    <FontAwesomeIcon
                      icon={menuItem.icon}
                      className={`mr-3 ${isCollapsed ? 'opacity-0' : ''}`}
                      style={{ color: selectedMenu === menuItem.id ? 'white' : brandColor }}
                    />
                    <span
                      style={{
                        fontWeight: selectedMenu === menuItem.id ? 'bold' : 'normal',
                        visibility: isCollapsed ? 'hidden' : 'visible',
                      }}
                    >
                      {menuItem.name}
                    </span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;