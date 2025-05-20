import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { useSpinner } from "../../../context/SpinnerContext.jsx";
import { useDashboard } from "../../../context/DashboardContext.jsx";
import {
  createVisitorDetail,
  updateVisitor,
} from "../../../services/visitorService";
import { getClassifications } from "../../../services/classificationService";
import { getDepartments } from "../../../services/departmentService";
import VisitorSearch from "../VisitorSearch";
import VisitorForm from "../VisitorForm";
import { VisitorTypeEnum } from "../../../enums/enums.js";

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
  const { setLoading } = useSpinner();
  const { refreshDashboard } = useDashboard();
  const [classifications, setClassifications] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [visitorType, setVisitorType] = useState(VisitorTypeEnum.INDIVIDUAL);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (show) {
      fetchClassifications();
      fetchDepartments();
      resetForm();
      setImageFile(null);
      setImagePreview(null);
    }
  }, [show]);

  console.log("selectedRow modal:", selectedRow);
  useEffect(() => {
    if (selectedRow) {
      setVisitorType(selectedRow.visitor?.visitorType);
      setImageFile(null); // clear File object
      setImagePreview(selectedRow.visitor?.visitorImage);
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
    setVisitorType(VisitorTypeEnum.INDIVIDUAL);
    setFormData(INITIAL_FORM_STATE);
  };

  const handleSearchComplete = ({ type, results }) => {
    setVisitorType(type);

    if (results.length > 0) {
      const visitor = results[0];
      setSelectedVisitor(visitor);

      setFormData((prev) => ({
        ...prev,
        firstName: type === VisitorTypeEnum.INDIVIDUAL ? visitor.firstName : "",
        lastName: type === VisitorTypeEnum.INDIVIDUAL ? visitor.lastName : "",
        groupName: type === VisitorTypeEnum.GROUP ? visitor.groupName : "",
        noOfVisitors:
          type === VisitorTypeEnum.GROUP ? visitor.noOfVisitors : "",
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
    const { name, value, type, checked } = e.target;
    // console.log("checked:", checked);
    if (type === "checkbox" && name === "expiryStatus") {
      setFormData((prev) => ({
        ...prev,
        expiryStatus: checked ? true : false,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (file) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isUpdate = Boolean(selectedRow?.visitDetail?._id);

    const formPayload = new FormData();

    formPayload.append("userId", user.userId);
    formPayload.append("visitorType", visitorType);
    formPayload.append("visitDate", formData.visitDate);
    formPayload.append("purpose", formData.purpose);
    formPayload.append("department", formData.department);
    formPayload.append("classification", formData.classification);
    formPayload.append(
      "noOfVisitors",
      visitorType === VisitorTypeEnum.GROUP
        ? selectedVisitor?.noOfVisitors || formData.noOfVisitors
        : 1
    );
    formPayload.append("expiryStatus", formData.expiryStatus);

    if (visitorType === VisitorTypeEnum.INDIVIDUAL) {
      formPayload.append(
        "firstName",
        selectedVisitor?.firstName || formData.firstName
      );
      formPayload.append(
        "lastName",
        selectedVisitor?.lastName || formData.lastName
      );
    } else {
      formPayload.append(
        "groupName",
        selectedVisitor?.groupName || formData.groupName
      );
    }

    console.log("imageFile:", imageFile);
    if (imageFile) {
      formPayload.append(
        "visitorImage",
        imageFile || selectedVisitor?.visitorImage
      );
    } else {
      toast.warning("Visitor image is required.");
      return;
    }

    setLoading(true);
    try {
      if (isUpdate) {
        await updateVisitor(selectedRow?.visitDetail?._id, formPayload);
        toast.success("Visitor updated successfully.");
      } else {
        await createVisitorDetail(formPayload);
        toast.success("Visitor created successfully.");
      }
      refreshList();
      refreshDashboard();
      onHide();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "An error occurred.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
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
          onChange={handleChange}
          visitor={selectedVisitor}
          type={visitorType}
          formData={formData}
          onImageChange={handleImageChange}
          classifications={classifications}
          departments={departments}
          imageFile={imageFile}
          imagePreview={imagePreview}
          setImageFile={setImageFile}
          setImagePreview={setImagePreview}
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
