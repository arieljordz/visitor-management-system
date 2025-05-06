import React, { useState } from "react";
import { toast } from "react-toastify";
import RoleSelector from "../../components/settings/RoleSelector";
import MenuItemCard from "../../components/settings/MenuItemCard";
import { upsertMenuConfig, getMenuByRole } from "../../services/menuConfigService";

const MenuConfigForm = () => {
  const [role, setRole] = useState("");
  const [menuItems, setMenuItems] = useState([]);


  const handleRoleChange = async (value) => {
    setRole(value);
    try {
      const response = await getMenuByRole(value);
      console.log("response:", response);
      if (response && Array.isArray(response.data.menuItems)) {
        const cleanedMenuItems = response.data.menuItems.map((item) => ({
          label: item.label,
          icon: item.icon,
          path: item.path,
          submenu: item.submenu.map((sub) => ({
            label: sub.label,
            path: sub.path
          })),
        }));
  
        setMenuItems(cleanedMenuItems);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Error retrieving menu config:", error);
      setMenuItems([]);
    }
  };
  

  const handleAddMenuItem = () =>
    setMenuItems([...menuItems, { label: "", icon: "", path: "", submenu: [] }]);

  const handleRemoveMenuItem = (index) =>
    setMenuItems(menuItems.filter((_, i) => i !== index));

  const handleMenuItemChange = (index, field, value) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const handleAddSubmenu = (menuIndex) => {
    const updated = [...menuItems];
    updated[menuIndex].submenu.push({ label: "", path: "" });
    setMenuItems(updated);
  };

  const handleRemoveSubmenu = (menuIndex, subIndex) => {
    const updated = [...menuItems];
    updated[menuIndex].submenu.splice(subIndex, 1);
    setMenuItems(updated);
  };

  const handleSubmenuChange = (menuIndex, subIndex, field, value) => {
    const updated = [...menuItems];
    updated[menuIndex].submenu[subIndex][field] = value;
    setMenuItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await upsertMenuConfig({ role, menuItems });
      toast.success("Menu config succesfully saved!");
      setRole("");
      setMenuItems([]);
    } catch (error) {
      console.error(error);
      toast.error("Error saving of menu config");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Create Menu Configuration</h3>
      <form onSubmit={handleSubmit}>
        <RoleSelector role={role} onChange={handleRoleChange} />

        {menuItems.map((item, index) => (
          <MenuItemCard
            key={index}
            item={item}
            index={index}
            onRemove={handleRemoveMenuItem}
            onChange={handleMenuItemChange}
            onAddSubmenu={handleAddSubmenu}
            onSubmenuChange={handleSubmenuChange}
            onRemoveSubmenu={handleRemoveSubmenu}
          />
        ))}

        <div className="d-flex justify-content-between mb-3">
          <button
            type="button"
            className="btn btn-primary mr-2"
            onClick={handleAddMenuItem}
          >
            Add Menu Item
          </button>
          <button type="submit" className="btn btn-success">
            Save Menu Config
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuConfigForm;
