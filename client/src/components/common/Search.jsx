import React from "react";
import { Row, Col, InputGroup, Form } from "react-bootstrap";

const Search = ({
  searchTerm,
  setSearchTerm,
  itemsPerPage,
  setItemsPerPage,
  setCurrentPage,
}) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    const value = e.target.value === "All" ? "All" : parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <Row className="mb-3 align-items-center">
      <Col xs={12} sm={4}>
        <InputGroup>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </InputGroup>
      </Col>
      <Col xs={12} sm={8} className="text-sm-end mt-2 mt-sm-0">
        <Form.Select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="form-control"
          style={{ maxWidth: "150px", marginLeft: "auto" }}
        >
          {[5, 10, 20, 50].map((option) => (
            <option key={option} value={option}>
              Show {option}
            </option>
          ))}
          <option value="All">Show All</option>
        </Form.Select>
      </Col>
    </Row>
  );
};

export default Search;
