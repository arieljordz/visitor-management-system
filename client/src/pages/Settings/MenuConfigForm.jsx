import React, { useState } from "react";
import {
  upsertMenuConfig,
  getMenuByRole,
} from "../../services/menuConfigService.js";

const MenuConfigForm = () => {
  const [role, setRole] = useState("");
  const [menuItems, setMenuItems] = useState([]);

  const handleRoleChange = async (value) => {
    setRole(value)
    const data = await getMenuByRole(role);
    
  };

  const handleAddMenuItem = () => {
    setMenuItems([
      ...menuItems,
      { label: "", icon: "", path: "", submenu: [] },
    ]);
  };

  const handleRemoveMenuItem = (index) => {
    const updated = [...menuItems];
    updated.splice(index, 1);
    setMenuItems(updated);
  };

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
      console.log("role:", role);
      console.log("menuItems:", menuItems);
      await upsertMenuConfig({ role, menuItems });
      alert("Menu config saved!");
      setRole("");
      setMenuItems([]);
    } catch (error) {
      console.error(error);
      alert("Error saving menu config");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Create Menu Configuration</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Role</label>
          <select
            className="form-control"
            value={role}
            // onChange={(e) => setRole(e.target.value)}
            onChange={(e) => handleRoleChange(e.target.value)}
            required
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="staff">Staff</option>
          </select>
        </div>

        {menuItems.map((item, index) => (
          <div key={index} className="card p-3 mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5>Menu Item {index + 1}</h5>
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => handleRemoveMenuItem(index)}
              >
                Remove Menu
              </button>
            </div>

            <div className="row g-2">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) =>
                    handleMenuItemChange(index, "label", e.target.value)
                  }
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Icon (e.g., fas fa-home)"
                  value={item.icon}
                  onChange={(e) =>
                    handleMenuItemChange(index, "icon", e.target.value)
                  }
                />
              </div>
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Path"
                  value={item.path}
                  onChange={(e) =>
                    handleMenuItemChange(index, "path", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="mt-2">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={() => handleAddSubmenu(index)}
              >
                Add Submenu
              </button>
            </div>

            {item.submenu.map((sub, subIndex) => (
              <div key={subIndex} className="row mt-2 ms-3 align-items-center">
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Submenu Label"
                    value={sub.label}
                    onChange={(e) =>
                      handleSubmenuChange(
                        index,
                        subIndex,
                        "label",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="col-md-5">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Submenu Path"
                    value={sub.path}
                    onChange={(e) =>
                      handleSubmenuChange(
                        index,
                        subIndex,
                        "path",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleRemoveSubmenu(index, subIndex)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
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
