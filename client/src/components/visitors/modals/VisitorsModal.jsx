import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  createVisitorDetail,
  updateVisitor,
} from "../../../services/visitorService";
import { getClassifications } from "../../../services/classificationService";
import { getDepartments } from "../../../services/departmentService";
import VisitorSearch from "../VisitorSearch";
import VisitorDetailsForm from "../VisitorDetailsForm";
import VisitorForm from "../VisitorForm";

const INITIAL_FORM_STATE = {
  firstName: "",
  lastName: "",
  groupName: "",
  visitDate: "",
  purpose: "",
  department: "",
  classification: "",
  noOfVisitors: "",
  expiryStatus: false,
};

const VisitorsModal = ({ show, onHide, selectedRow, refreshList }) => {
  const { user } = useAuth();
  const [classifications, setClassifications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorType, setVisitorType] = useState("Individual");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  useEffect(() => {
    if (show) {
      fetchClassifications();
      fetchDepartments();
      resetForm();
    }
  }, [show]);

  // console.log("selectedRow modal:", selectedRow);
  useEffect(() => {
    if (selectedRow) {
      setVisitorType(selectedRow.visitor?.visitorType);
      setFormData({
        firstName: selectedRow.visitor?.firstName || "",
        lastName: selectedRow.visitor?.lastName || "",
        groupName: selectedRow.visitor?.groupName || "",
        visitDate: selectedRow.visitDetail?.visitDate
          ? new Date(selectedRow.visitDetail.visitDate)
              .toISOString()
              .slice(0, 10)
          : "",
        purpose: selectedRow.visitDetail?.purpose || "",
        department: selectedRow.visitDetail?.department || "",
        classification: selectedRow.visitDetail?.classification || "",
        noOfVisitors: selectedRow.visitDetail?.noOfVisitors || "",
        expiryStatus: selectedRow.visitDetail?.expiryStatus || false,
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
  }, [selectedRow]);

  const fetchClassifications = async () => {
    try {
      const data = await getClassifications();
      setClassifications(data || []);
    } catch (err) {
      console.error("Error fetching classifications:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const resetForm = () => {
    setSelectedVisitor(null);
    setVisitorType("Individual");
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSearchComplete = ({ type, results }) => {
    setVisitorType(type);

    if (results.length > 0) {
      const visitor = results[0];
      setSelectedVisitor(visitor);

      setFormData((prev) => ({
        ...prev,
        firstName: type === "Individual" ? visitor.firstName : "",
        lastName: type === "Individual" ? visitor.lastName : "",
        groupName: type === "Group" ? visitor.groupName : "",
        noOfVisitors: type === "Group" ? visitor.noOfVisitors : "",
      }));
    } else {
      setSelectedVisitor(null);
    }
  };

  const handleClearSearch = () => {
    setSelectedVisitor(null);
    setVisitorType("Individual");
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("checked:", checked);
    if (type === "checkbox" && name === "expiryStatus") {
      setFormData((prev) => ({
        ...prev,
        expiryStatus: checked ? true : false,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isUpdate = Boolean(selectedRow?.visitDetail?._id);
    const payload = {
      userId: user.userId,
      visitorType,
      firstName:
        visitorType === "Individual"
          ? selectedVisitor?.firstName || formData.firstName
          : undefined,
      lastName:
        visitorType === "Individual"
          ? selectedVisitor?.lastName || formData.lastName
          : undefined,
      groupName:
        visitorType === "Group"
          ? selectedVisitor?.groupName || formData.groupName
          : undefined,
      visitDate: formData.visitDate,
      purpose: formData.purpose,
      department: formData.department,
      classification: formData.classification,
      noOfVisitors:
        visitorType === "Group"
          ? selectedVisitor?.noOfVisitors || formData.noOfVisitors
          : 1,
      expiryStatus: formData.expiryStatus,
    };

    // console.log("payload:", payload);
    try {
      if (isUpdate) {
        await updateVisitor(selectedRow?.visitDetail?._id, payload);
        toast.success("Visitor updated successfully.");
      } else {
        await createVisitorDetail(payload);
        toast.success("Visitor created successfully.");
      }
      refreshList();
      onHide();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred.");
      console.error("Error:", err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" size="lg" centered>
      <div className="modal-header">
        <h5 className="modal-title fw-bold">
          {selectedRow ? "Edit Visitor" : "Add Visitor"}
        </h5>
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
          type={visitorType}
          selectedRow={selectedRow}
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
          departments={departments}
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
