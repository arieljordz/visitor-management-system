import React from "react";
import Select from "react-select";
import { Form } from "react-bootstrap";
import { VisitorTypeEnum } from "../../enums/enums.js";

const VisitorDropdown = ({
  searchType,
  options,
  loading,
  selectedVisitor,
  onChange,
}) => {
  const isIndividual = searchType === VisitorTypeEnum.INDIVIDUAL;

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#007bff" : "white",
      color: state.isSelected ? "white" : "black",
      cursor: "pointer",
    }),
    control: (provided) => ({
      ...provided,
      borderColor: loading ? "gray" : "#ced4da",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#80bdff",
      },
    }),
  };

  const getLabel = (option) => {
    return isIndividual
      ? `${option.firstName} ${option.lastName}`
      : option.groupName;
  };

  const labelText = isIndividual ? "Select Individual" : "Select Group";
  const placeholderText = loading
    ? "Loading options..."
    : `Search ${searchType.toLowerCase()}...`;

  return (
    <Form.Group className="mb-3">
      <Form.Label>{labelText}</Form.Label>
      <Select
        isClearable
        isDisabled={loading || options.length === 0}
        isLoading={loading}
        options={options}
        value={selectedVisitor}
        onChange={onChange}
        placeholder={placeholderText}
        noOptionsMessage={() => (loading ? "Loading..." : "No options found")}
        styles={customStyles}
        getOptionLabel={getLabel}
        getOptionValue={(option) =>
          isIndividual
            ? `${option.firstName}-${option.lastName}`
            : option.groupName
        }
      />
    </Form.Group>
  );
};

export default VisitorDropdown;
