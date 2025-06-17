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
  faDollarSign,
  faSitemap,
  faProcedures,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { faProductHunt } from "@fortawesome/free-brands-svg-icons";

// Modal component
const LicenseModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-xl font-semibold text-red-600 mb-4">License Expired</h2>
        <p className="text-gray-700">
          Please renew your expired license to continue using the system.
        </p>
      </div>
    </div>
  );
};

const Sidebar = ({ isCollapsed, setIsCollapsed, isVisible }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [openSubMenu, setOpenSubMenu] = useState(null);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const brandColor = localStorage.getItem("brandColor") || "#1E467A";
  const role = localStorage.getItem("role");
  const licenseExpirationDate = new Date(localStorage.getItem("expiredDate"));
  const today = new Date();
  const isLicenseExpired = licenseExpirationDate <= today;

  const location = useLocation();
  const navigate = useNavigate();

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
              {
                id: "PharmacyOverview",
                name: "Pharmacy Overview",
                path: "/PharmacSphere/Portal/Dashboard/PharmacyOverview",
                icon: faDashboard,
              },
              {
                id: "Dashboard",
                name: "Dashboard",
                path: "/PharmacSphere/Portal/Dashboard/Dashboard",
                icon: faDashboard,
              },
              {
                id: "BranchOverview",
                name: "Branch Overview",
                path: "/PharmacSphere/Portal/Dashboard/BranchOverview",
                icon: faDashboard,
              },
            ],
          },
          {
            id: "PharmacyManagement",
            name: "Pharmacy Management",
            icon: faClinicMedical,
            subPages: [
              {
                id: "ManagePharmacy",
                name: "Management Pharmacy",
                path: "/PharmacSphere/Portal/PharmacyManagement/ManagePharmacy",
                icon: faKitMedical,
              },
              {
                id: "UnautorisedPharmacy",
                name: "Unautorised Pharmacy",
                path: "/PharmacSphere/Portal/PharmacyManagement/UnautorisedPharmacy",
                icon: faClockFour,
              },
              {
                id: "RejectedPharmacy",
                name: "Rejected Pharmacy",
                path: "/PharmacSphere/Portal/PharmacyManagement/RejectedPharmacy",
                icon: faTimesCircle,
              },
              {
                id: "AutorisePharmacy",
                name: "Autorise Pharmacy",
                path: "/PharmacSphere/Portal/PharmacyManagement/AutorisePharmacy",
                icon: faLockOpen,
              },
            ],
          },
          {
            id: "BranchManagement",
            name: "Branch Management",
            icon: faCodeBranch,
            subPages: [
              {
                id: "ManageBranch",
                name: "Manage Branch",
                path: "/PharmacSphere/Portal/BranchManagement/ManageBranch",
                icon: faSubway,
              },
              {
                id: "DeletedBranch",
                name: "Deleted Branch",
                path: "/PharmacSphere/Portal/BranchManagement/ClosedBranch",
                icon: faDeleteLeft,
              },
            ],
          },
          {
            id: "AccountSetting",
            name: "Account Settings",
            icon: faCogs,
            subPages: [
              {
                id: "ManageUser",
                name: "User Management",
                path: "/PharmacSphere/Portal/AccountSetting/ManageUser",
                icon: faUser,
              },
              {
                id: "ManagePermission",
                name: "Manage Permission",
                path: "/PharmacSphere/Portal/AccountSetting/ManagePermission",
                icon: faKey,
              },
              {
                id: "ManageRole",
                name: "Manage Role",
                path: "/PharmacSphere/Portal/AccountSetting/ManageRole",
                icon: faUnlock,
              },
            ],
          },
          {
            id: "ProductManagement",
            name: "Product Management",
            icon: faProductHunt,
            path: "/PharmacSphere/Portal/ProductManagement",
          },
          {
            id: "OrderManagement",
            name: "Order Management",
            icon: faSitemap,
            path: "/PharmacSphere/Portal/OrderManagement",
          },
          {
            id: "PaymentProcessing",
            name: "Payment Processing",
            icon: faDollarSign,
            path: "/PharmacSphere/Portal/PaymentProcessing",
          },
          {
            id: "Pharmacy",
            name: "Manage Pharmacy",
            icon: faProductHunt,
            path: "/PharmacSphere/Portal/Pharmacy",
          },
        ];

        const filtered = menu
          .map((menuItem) => ({
            ...menuItem,
            hasPermission: userPermissions.includes(menuItem.id),
            subPages: menuItem.subPages
              ? menuItem.subPages.filter((subPage) =>
                  userPermissions.includes(subPage.id)
                )
              : null,
          }))
          .filter(
            (menuItem) =>
              menuItem.hasPermission ||
              (menuItem.subPages && menuItem.subPages.length > 0)
          );

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
      (item) =>
        item.path === currentPath ||
        item.subPages?.some((sub) => sub.path === currentPath)
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

  useEffect(() => {
    if (
      role !== "67cbe327916a31447870fc34" &&
      role !== "67de99c1557436d838bd3134"
    ) {
      if (isLicenseExpired) {
        const allowedPaths = ["/PharmacSphere/Portal/Pharmacy"];
        if (!allowedPaths.includes(location.pathname)) {
          setShowLicenseModal(true);
          navigate("/PharmacSphere/Portal");
        }
      }
    }
  }, [role, isLicenseExpired, location, navigate]);

  const handleSubMenuToggle = (menuId) => {
    setOpenSubMenu(openSubMenu === menuId ? null : menuId);
  };

  return (
    <>
      <aside
        className={`bg-white transition-all duration-300 ${
          isCollapsed ? "w-0" : "w-50"
        } ${isVisible ? "block" : "hidden"}`}
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
                        className={`flex items-center h-9 px-2 cursor-pointer ${
                          isLicenseExpired && menuItem.id !== "Pharmacy"
                            ? "opacity-50"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            selectedMenu === menuItem.id
                              ? brandColor
                              : "transparent",
                          color:
                            selectedMenu === menuItem.id
                              ? "white"
                              : brandColor,
                        }}
                        onClick={() => {
                          if (
                            !(
                              isLicenseExpired &&
                              menuItem.id !== "Pharmacy" &&
                              role !== "67cbe327916a31447870fc34" &&
                              role !== "67de99c1557436d838bd3134"
                            )
                          ) {
                            handleSubMenuToggle(menuItem.id);
                            setSelectedMenu(
                              menuItem.id === selectedMenu
                                ? null
                                : menuItem.id
                            );
                          }
                        }}
                      >
                        <FontAwesomeIcon
                          icon={menuItem.icon}
                          className={`mr-3 ${isCollapsed ? "opacity-0" : ""}`}
                          style={{
                            color:
                              selectedMenu === menuItem.id
                                ? "white"
                                : brandColor,
                          }}
                        />
                        <span
                          style={{
                            fontWeight:
                              selectedMenu === menuItem.id
                                ? "bold"
                                : "normal",
                            visibility: isCollapsed ? "hidden" : "visible",
                          }}
                        >
                          {menuItem.name}
                        </span>
                      </span>
                      <ul
                        className={`ml-6 mt-2 ${
                          openSubMenu === menuItem.id ? "" : "hidden"
                        }`}
                      >
                        {menuItem.subPages.map((subPage) => (
                          <li className="mb-2" key={subPage.id}>
                            <Link
                              to={subPage.path}
                              className={`flex items-center h-9 px-2 ${
                                isLicenseExpired &&
                                role !== "67cbe327916a31447870fc34" &&
                                role !== "67de99c1557436d838bd3134"
                                  ? "opacity-50"
                                  : ""
                              }`}
                              style={{
                                backgroundColor:
                                  location.pathname === subPage.path
                                    ? brandColor
                                    : "transparent",
                                color:
                                  location.pathname === subPage.path
                                    ? "white"
                                    : brandColor,
                              }}
                              onClick={() => {
                                if (
                                  !(
                                    isLicenseExpired &&
                                    role !==
                                      "67cbe327916a31447870fc34" &&
                                    role !==
                                      "67de99c1557436d838bd3134"
                                  )
                                ) {
                                  setSelectedMenu(menuItem.id);
                                }
                              }}
                            >
                              <FontAwesomeIcon
                                icon={subPage.icon}
                                className={`mr-3 ${
                                  isCollapsed ? "opacity-0" : ""
                                }`}
                                style={{
                                  color:
                                    location.pathname === subPage.path
                                      ? "white"
                                      : brandColor,
                                }}
                              />
                              <span
                                style={{
                                  visibility: isCollapsed
                                    ? "hidden"
                                    : "visible",
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
                      className={`flex items-center h-9 px-2 ${
                        isLicenseExpired &&
                        menuItem.id !== "Pharmacy" &&
                        role !== "67cbe327916a31447870fc34" &&
                        role !== "67de99c1557436d838bd3134"
                          ? "opacity-50"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          selectedMenu === menuItem.id
                            ? brandColor
                            : "transparent",
                        color:
                          selectedMenu === menuItem.id
                            ? "white"
                            : brandColor,
                      }}
                      onClick={() => {
                        if (
                          !(
                            isLicenseExpired &&
                            menuItem.id !== "Pharmacy" &&
                            role !== "67cbe327916a31447870fc34" &&
                            role !== "67de99c1557436d838bd3134"
                          )
                        ) {
                          setSelectedMenu(menuItem.id);
                        }
                      }}
                    >
                      <FontAwesomeIcon
                        icon={menuItem.icon}
                        className={`mr-3 ${isCollapsed ? "opacity-0" : ""}`}
                        style={{
                          color:
                            selectedMenu === menuItem.id
                              ? "white"
                              : brandColor,
                        }}
                      />
                      <span
                        style={{
                          fontWeight:
                            selectedMenu === menuItem.id ? "bold" : "normal",
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

      {/* License modal */}
      {showLicenseModal && (
        <LicenseModal onClose={() => setShowLicenseModal(false)} />
      )}
    </>
  );
};

export default Sidebar;
