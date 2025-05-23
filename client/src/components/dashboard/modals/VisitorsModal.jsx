import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { createVisitorDetail } from "../../../services/visitorService";
import { getClassificationsByUserId } from "../../../services/classificationService";
import VisitorSearch from "../VisitorSearch";
import VisitorDetailsForm from "../VisitorDetailsForm";
import VisitorForm from "../VisitorForm";
import { VisitorTypeEnum, UserRoleEnum } from "../../../enums/enums.js";

const VisitorsModal = ({ user, show, onHide, refreshList }) => {
  const [classifications, setClassifications] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorType, setVisitorType] = useState(VisitorTypeEnum.INDIVIDUAL);
  const [formData, setFormData] = useState({
    visitDate: "",
    purpose: "",
    classification: "",
    noOfVisitors: "",
  });

  const subscriberId = user.role === UserRoleEnum.SUBSCRIBER ? user.userId: user.subscriberId;

  // Fetch classifications and reset form when modal opens
  useEffect(() => {
    if (show) {
      fetchClassifications();
      resetState();
    }
  }, [show]);

  const fetchClassifications = async () => {
    try {
      const data = await getClassificationsByUserId(subscriberId);
      setClassifications(data || []);
    } catch (err) {
      console.error("Error fetching classifications:", err);
    }
  };

  const resetState = () => {
    setSelectedVisitor(null);
    setVisitorType(VisitorTypeEnum.INDIVIDUAL);
    setFormData({
      firstName: "",
      lastName: "",
      visitDate: "",
      purpose: "",
      classification: "",
      noOfVisitors: "",
    });
  };

  const handleSearchComplete = ({ type, results }) => {
    setVisitorType(type);

    if (results.length > 0) {
      const visitor = results[0];
      setSelectedVisitor(visitor);

      // Also populate formData for clarity
      setFormData((prev) => ({
        ...prev,
        firstName: type === VisitorTypeEnum.INDIVIDUAL ? visitor.firstName : "",
        lastName: type === VisitorTypeEnum.INDIVIDUAL ? visitor.lastName : "",
        groupName: type === VisitorTypeEnum.GROUP ? visitor.groupName : "",
        noOfVisitors: type === VisitorTypeEnum.GROUP ? visitor.noOfVisitors : "",
      }));
    } else {
      setSelectedVisitor(null);
    }
  };

  const handleClearSearch = () => {
    setSelectedVisitor(null);
    setVisitorType(VisitorTypeEnum.INDIVIDUAL);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const visitPayload = {
        userId: user.userId,
        visitorType,
        firstName:
          visitorType === VisitorTypeEnum.INDIVIDUAL
            ? selectedVisitor?.firstName || formData.firstName
            : undefined,
        lastName:
          visitorType === VisitorTypeEnum.INDIVIDUAL
            ? selectedVisitor?.lastName || formData.lastName
            : undefined,
        groupName:
          visitorType === VisitorTypeEnum.GROUP
            ? selectedVisitor?.groupName || formData.groupName
            : undefined,
        visitDate: formData.visitDate,
        purpose: formData.purpose,
        classification: formData.classification,
        noOfVisitors:
          visitorType === VisitorTypeEnum.GROUP
            ? selectedVisitor?.noOfVisitors || formData.noOfVisitors
            : 1,
      };

      const response = await createVisitorDetail(visitPayload);
      if (response?.status === 201) {
        toast.success("Visitor and visit record created.");
        refreshList();
        onHide();
      } else {
        toast.error(
          response?.data?.message || "Failed to save visitor and visit record."
        );
      }
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.error("Error:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg" centered>
      <div className="modal-header">
        <h5 className="modal-title fw-bold">Add Visitor</h5>
        <button
          type="button"
          className="close"
          onClick={onHide}
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <Modal.Body>
        <VisitorSearch
          onSearchComplete={handleSearchComplete}
          onClearSearch={handleClearSearch}
          formData={formData} 
          onChange={handleChange} 
        />
        <hr />
        <VisitorForm
          visitor={selectedVisitor}
          type={visitorType}
          onChange={handleChange}
          formData={formData}
        />

        <VisitorDetailsForm
          type={visitorType}
          formData={formData}
          onChange={handleChange}
          classifications={classifications}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VisitorsModal;
