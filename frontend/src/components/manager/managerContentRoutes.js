import React, { useState } from "react";
import BranchManagement from "./ManagerBranchManagement";
import BranchOverview from "./ManagerBranchOverview";
import UserManagement from "./ManagerUserManagement";
import Permission from "../../components/admin/contents/UserManagement/Permission";

const Content = ({ brandColor, activeMainItem, activeSubItem }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const renderContent = () => {
    if (activeMainItem === "Dashboard") {
      if (activeSubItem === "BranchOverview") {
        return (
          <BranchOverview
            setActiveCategory={setActiveCategory}
            brandColor={brandColor}
          />
        );
      }  else if (activeSubItem === "UserOverview") {
        return <div>User Overview Component</div>;
      } else if (activeSubItem === "PerformanceMetrics") {
        return <div>Performance Metrics Component</div>;
      }
    } else if (activeMainItem === "BranchManagement") {
      return <BranchManagement brandColor={brandColor} />;
    } else if (activeMainItem === "AccountSetting") {
      if (activeSubItem === "User") {
        return <UserManagement brandColor={brandColor} />;
      } 
      else if (activeSubItem === "UserPermissions") {
        return <Permission brandColor={brandColor} />;
      } 
      else if (activeSubItem === "UserLicense") {
        return <div>User License Component</div>; 
      }
    }
    return null;
  };

  return <main >{renderContent()}</main>;
};

export default Content;