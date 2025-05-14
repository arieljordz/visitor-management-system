import React from "react";
import { Col, Form, Row } from "react-bootstrap";

const FormInput = ({ label, name, value, onChange, readOnly, placeholder }) => {
  return (
    <Col md={6}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="text"
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={onChange}
        readOnly={readOnly}
      />
    </Col>
  );
};

const VisitorForm = ({ onChange, visitor, type, formData }) => {
  const isReadOnly = visitor !== null;
  if (type === "Individual") {
    return (
      <Row>
        <FormInput
          label="First Name"
          name="firstName"
          value={isReadOnly ? visitor?.firstName : formData.firstName}
          onChange={onChange}
          readOnly={isReadOnly}
          placeholder="Enter first name"
        />
        <FormInput
          label="Last Name"
          name="lastName"
          value={isReadOnly ? visitor?.lastName : formData.lastName}
          onChange={onChange}
          readOnly={isReadOnly}
          placeholder="Enter last name"
        />
      </Row>
    );
  }

  return (
    <Row>
    <FormInput
      label="Group Name"
      name="groupName"
      value={isReadOnly ? visitor?.groupName : formData.groupName}
      onChange={onChange}
      readOnly={isReadOnly}
      placeholder="Enter group name"
    />
    <FormInput
      label="No. of Visitors"
      name="noOfVisitors"
      value={formData.noOfVisitors}
      onChange={onChange}
      type="number"
      placeholder="Enter no. of visitors"
    />
  </Row>

  );
};

export default VisitorForm;
