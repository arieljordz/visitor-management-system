import React, { useEffect, useState } from "react";
import { Col, Form, Row, Image } from "react-bootstrap";
import { VisitorTypeEnum, ValidityEnum } from "../../enums/enums";

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
                label={
                  <span>
                    First Name <span className="text-danger">*</span>
                  </span>
                }
                name="firstName"
                value={isReadOnly ? visitor?.firstName : formData.firstName}
                onChange={onChange}
                readOnly={isReadOnly}
                placeholder="Enter first name"
                required
              />
              <FormInput
                label={
                  <span>
                    Last Name <span className="text-danger">*</span>
                  </span>
                }
                name="lastName"
                value={isReadOnly ? visitor?.lastName : formData.lastName}
                onChange={onChange}
                readOnly={isReadOnly}
                placeholder="Enter last name"
                required
              />
            </>
          ) : (
            <>
              <FormInput
                label={
                  <span>
                    Group Name <span className="text-danger">*</span>
                  </span>
                }
                name="groupName"
                value={isReadOnly ? visitor?.groupName : formData.groupName}
                onChange={onChange}
                readOnly={isReadOnly}
                placeholder="Enter group name"
                required
              />
              <FormInput
                label={
                  <span>
                    No. of Visitors <span className="text-danger">*</span>
                  </span>
                }
                name="noOfVisitors"
                value={formData.noOfVisitors}
                onChange={onChange}
                type="number"
                placeholder="Enter number of visitors"
                required
              />
            </>
          )}

          <FormInput
            label={
              <span>
                Visit Date <span className="text-danger">*</span>
              </span>
            }
            name="visitDate"
            value={formData.visitDate}
            onChange={onChange}
            type="date"
            required
          />
          <FormInput
            label={
              <span>
                Purpose <span className="text-danger">*</span>
              </span>
            }
            name="purpose"
            value={formData.purpose}
            onChange={onChange}
            placeholder="Enter purpose"
            required
          />

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                Department <span className="text-danger">*</span>
              </Form.Label>
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
              <Form.Label>
                Classification <span className="text-danger">*</span>
              </Form.Label>
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

          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label>
                Validity <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="validity"
                value={formData.validity}
                onChange={onChange}
                className="form-control"
                required
              >
                <option value="">-- Select Validity --</option>
                <option value={ValidityEnum.VALID_TODAY}>
                  {ValidityEnum.VALID_TODAY.toUpperCase()}
                </option>
                <option value={ValidityEnum.PERMANENT}>
                  {ValidityEnum.PERMANENT.toUpperCase()}
                </option>
                <option value={ValidityEnum.EXPIRED}>
                  {ValidityEnum.EXPIRED.toUpperCase()}
                </option>
              </Form.Select>
            </Form.Group>
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
