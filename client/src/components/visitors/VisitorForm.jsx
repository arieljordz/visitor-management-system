import React, { useEffect, useState } from "react";
import { Col, Form, Row, Image } from "react-bootstrap";
import { VisitorTypeEnum } from "../../enums/enums";

const FormInput = ({
  label,
  name,
  value,
  onChange,
  readOnly,
  placeholder,
  type = "text",
  md = 6,
}) => (
  <Form.Group as={Col} md={md} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type={type}
      name={name}
      value={value || ""}
      placeholder={placeholder}
      onChange={onChange}
      readOnly={readOnly}
    />
  </Form.Group>
);

const VisitorForm = ({
  onChange,
  visitor,
  type,
  formData,
  onImageChange,
  classifications,
  departments,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
}) => {
  const isReadOnly = visitor !== null;

  const handleUploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setImageFile(file); // ✅ Save the actual file object
      setImagePreview(objectUrl); // ✅ Save preview URL

      if (onImageChange) onImageChange(file);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Row>
      {/* Left Column: Form Fields */}
      <Col md={8}>
        <Row>
          {type === VisitorTypeEnum.INDIVIDUAL ? (
            <>
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
            </>
          ) : (
            <>
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
                placeholder="Enter number of visitors"
              />
            </>
          )}

          <FormInput
            label="Visit Date"
            name="visitDate"
            value={formData.visitDate}
            onChange={onChange}
            type="date"
          />
          <FormInput
            label="Purpose"
            name="purpose"
            value={formData.purpose}
            onChange={onChange}
            placeholder="Enter purpose"
          />

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Department</Form.Label>
              <Form.Select
                name="department"
                value={formData.department}
                onChange={onChange}
                className="form-control"
                required
              >
                <option value="">-- Select Department --</option>
                {departments.map((d, i) => (
                  <option key={i} value={d.description}>
                    {d.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>Classification</Form.Label>
              <Form.Select
                name="classification"
                value={formData.classification}
                onChange={onChange}
                className="form-control"
                required
              >
                <option value="">-- Select Classification --</option>
                {classifications.map((c, i) => (
                  <option key={i} value={c.description}>
                    {c.description}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={12}>
            <div className="form-group">
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="status-switch"
                  name="expiryStatus"
                  checked={formData.expiryStatus === true}
                  onChange={onChange}
                />
                <label className="custom-control-label" htmlFor="status-switch">
                  {formData.expiryStatus === true
                    ? "No Expiration"
                    : "Valid Today"}
                </label>
              </div>
            </div>
          </Col>
        </Row>
      </Col>

      {/* Right Column: Image Preview & Upload */}
      <Col md={4}>
        <div
          className="border rounded d-flex align-items-center justify-content-center mb-3"
          style={{ height: "250px", backgroundColor: "#f8f9fa" }}
        >
          {imagePreview ? (
            <Image
              src={imagePreview}
              alt="Proof Preview"
              fluid
              rounded
              thumbnail
              style={{
                maxHeight: "100%",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <span className="text-muted">No image uploaded</span>
          )}
        </div>
        <Form.Group>
          {/* <Form.Label>Upload Image</Form.Label> */}
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleUploadImage}
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default VisitorForm;
