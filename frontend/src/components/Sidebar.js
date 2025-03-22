import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faClipboardList,
  faCogs,
  faUser,
  faClinicMedical,
  faKitMedical,
  faLockOpen,
  faTimesCircle,
  faClockFour,
  faUnlock,
  faKey,
  faDeleteLeft,
  faSubway,
  faCodeBranch,
  faDashboard,
  faHouseMedicalFlag,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, setIsCollapsed, isVisible }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const brandColor = localStorage.getItem("brandColor") || "#1E467A";
  const location = useLocation();
  const [filteredMenu, setFilteredMenu] = useState([]);
  const role = localStorage.getItem("role");

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const PermissionResponse = await axios.get(
          `http://localhost:5000/role/getPermissionsByRoleName/${role}`
        );

        const userPermissions = PermissionResponse.data.pageNames || [];

        const menu = [
          {
            id: "Dashboard",
            name: "Dashboard",
            icon: faDashboard,
            subPages: [
              { id: "PharmacyOverview", name: "Pharmacy Overview", path: "/PharmacSphere/Portal/Dashboard/PharmacyOverview", icon: faDashboard },
              { id: "BranchOverview", name: "Branch Overview", path: "/PharmacSphere/Portal/Dashboard/BranchOverview", icon: faDashboard },
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
          {
            id: "BranchManagement",
            name: "Branch Management",
            icon: faCodeBranch,
            subPages: [
              { id: "ManageBranch", name: "Manage Branch", path: "/PharmacSphere/Portal/BranchManagement/ManageBranch", icon: faSubway },
              { id: "DeletedBranch", name: "Deleted Branch", path: "/PharmacSphere/Portal/BranchManagement/ClosedBranch", icon: faDeleteLeft },
            ],
          },
          {
            id: "ProductManagement",
            name: "Product Management",
            icon: faHouseMedicalFlag,
            path: "/PharmacSphere/Portal/ProductManagement",
          },
          {
            id: "OrderManagement",
            name: "Order Management",
            icon: faHouseMedicalFlag,
            path: "/PharmacSphere/Portal/OrderManagement",
          },
        ];

        const filtered = menu
          .map((menuItem) => ({
            ...menuItem,
            hasPermission: userPermissions.includes(menuItem.id),
            subPages: menuItem.subPages
              ? menuItem.subPages.filter((subPage) => userPermissions.includes(subPage.id))
              : null,
          }))
          .filter((menuItem) => menuItem.hasPermission || (menuItem.subPages && menuItem.subPages.length > 0));
        
        setFilteredMenu(filtered);
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchPermissions();
  }, [role]);

  useEffect(() => {
    const currentPath = location.pathname;
    const foundMenu = filteredMenu.find(
      (item) => item.path === currentPath || item.subPages?.some((sub) => sub.path === currentPath)
    );

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
      className={`bg-white  transition-all duration-300 ${isCollapsed ? "w-0" : "w-50"} ${isVisible ? "block" : "hidden"}`}
      style={{ transition: "width 0.3s ease" }}
    >
      <div className="flex flex-col h-full">
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {filteredMenu.map((menuItem) => (
              <li className="mb-4" key={menuItem.id}>
                {menuItem.subPages ? (
                  <>
                    <span
                      className="flex items-center h-9 px-2 cursor-pointer"
                      style={{
                        backgroundColor: selectedMenu === menuItem.id ? brandColor : "transparent",
                        color: selectedMenu === menuItem.id ? "white" : brandColor,
                      }}
                      onClick={() => {
                        handleSubMenuToggle(menuItem.id);
                        setSelectedMenu(menuItem.id === selectedMenu ? null : menuItem.id);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={menuItem.icon}
                        className={`mr-3 ${isCollapsed ? "opacity-0" : ""}`}
                        style={{ color: selectedMenu === menuItem.id ? "white" : brandColor }}
                      />
                      <span
                        style={{
                          fontWeight: selectedMenu === menuItem.id ? "bold" : "normal",
                          visibility: isCollapsed ? "hidden" : "visible",
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
                              backgroundColor: location.pathname === subPage.path ? brandColor : "transparent",
                              color: location.pathname === subPage.path ? "white" : brandColor,
                            }}
                            onClick={() => setSelectedMenu(menuItem.id)}
                          >
                            <FontAwesomeIcon
                              icon={subPage.icon}
                              className={`mr-3 ${isCollapsed ? "opacity-0" : ""}`}
                              style={{
                                color: location.pathname === subPage.path ? "white" : brandColor,
                              }}
                            />
                            <span
                              style={{
                                visibility: isCollapsed ? "hidden" : "visible",
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
                      backgroundColor: selectedMenu === menuItem.id ? brandColor : "transparent",
                      color: selectedMenu === menuItem.id ? "white" : brandColor,
                    }}
                    onClick={() => setSelectedMenu(menuItem.id)}
                  >
                    <FontAwesomeIcon
                      icon={menuItem.icon}
                      className={`mr-3 ${isCollapsed ? "opacity-0" : ""}`}
                      style={{ color: selectedMenu === menuItem.id ? "white" : brandColor }}
                    />
                    <span
                      style={{
                        fontWeight: selectedMenu === menuItem.id ? "bold" : "normal",
                        visibility: isCollapsed ? "hidden" : "visible",
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