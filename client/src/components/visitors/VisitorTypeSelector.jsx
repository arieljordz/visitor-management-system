import React from "react";

const VisitorTypeSelector = ({ selectedType, onChange, selectedRow }) => {
  const types = ["Individual", "Group"];

  return (
    <div className="form-group mb-3">
      <label className="d-block">Visitor Type</label>
      {types.map((type) => (
        <div className="icheck-primary d-inline mr-3" key={type}>
          <input
            type="radio"
            id={`radio-${type}`}
            name="visitorType"
            value={type}
            checked={selectedType === type}
            onChange={() => onChange(type)}
            disabled={selectedRow !== null}
          />
          <label htmlFor={`radio-${type}`}>{type}</label>
        </div>
      ))}
    </div>
  );
};

export default VisitorTypeSelector;
