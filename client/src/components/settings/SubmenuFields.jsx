const SubmenuFields = ({
    submenus,
    onChange,
    onRemove,
    menuIndex
  }) => (
    <>
      {submenus.map((sub, subIndex) => (
        <div key={subIndex} className="row mt-2 ms-3 align-items-center">
          <div className="col-md-5">
            <input
              type="text"
              className="form-control"
              placeholder="Submenu Label"
              value={sub.label}
              onChange={(e) =>
                onChange(menuIndex, subIndex, "label", e.target.value)
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
                onChange(menuIndex, subIndex, "path", e.target.value)
              }
              required
            />
          </div>
          <div className="col-md-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => onRemove(menuIndex, subIndex)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </>
  );
  
  export default SubmenuFields;
  