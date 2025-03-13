import React, { useState } from "react";
import ItemOverview from "./storekepperItemOverview";
import AddItem from "./storekeeperItem";

const Content = ({ brandColor, activeMainItem, activeSubItem }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const renderContent = () => {
    if (activeMainItem === "Dashboard") {
      if (activeSubItem === "ItemOverview") {
        return (
          <ItemOverview
            setActiveCategory={setActiveCategory}
            brandColor={brandColor}
          />
        );
      }
    } else if (activeMainItem === "AddItem") {
      return <AddItem brandColor={brandColor} />;
    }
    return null;
  };

  return <main>{renderContent()}</main>;
};

export default Content;
