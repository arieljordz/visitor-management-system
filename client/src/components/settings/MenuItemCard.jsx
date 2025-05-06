import SubmenuFields from "./SubmenuFields";

const MenuItemCard = ({
  item,
  index,
  onRemove,
  onChange,
  onAddSubmenu,
  onSubmenuChange,
  onRemoveSubmenu
}) => (
  <div className="card p-3 mb-3">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <h5>Menu Item {index + 1}</h5>
      <button
        type="button"
        className="btn btn-sm btn-danger"
        onClick={() => onRemove(index)}
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
          onChange={(e) => onChange(index, "label", e.target.value)}
          required
        />
      </div>
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Icon (e.g., fas fa-home)"
          value={item.icon}
          onChange={(e) => onChange(index, "icon", e.target.value)}
        />
      </div>
      <div className="col-md-4">
        <input
          type="text"
          className="form-control"
          placeholder="Path"
          value={item.path}
          onChange={(e) => onChange(index, "path", e.target.value)}
          required
        />
      </div>
    </div>

    <div className="mt-2">
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={() => onAddSubmenu(index)}
      >
        Add Submenu
      </button>
    </div>

    <SubmenuFields
      submenus={item.submenu}
      menuIndex={index}
      onChange={onSubmenuChange}
      onRemove={onRemoveSubmenu}
    />
  </div>
);

export default MenuItemCard;
