import React, { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import ClassificationTable from "../../components/fileMaintenance/tables/ClassificationTable";
import ClassificationModal from "../../components/fileMaintenance/modals/ClassificationModal";
import {
  getClassificationsByUserId,
  getClassificationById,
  deleteClassification,
} from "../../services/classificationService.js";
import { StatusEnum, UserRoleEnum } from "../../enums/enums.js";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function FMClassification() {
  const { user } = useAuth();
  const [classifications, setClassifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const subscriberId = user.role === UserRoleEnum.SUBSCRIBER ? user.userId: user.subscriberId;

  useEffect(() => {
    if (user?.userId) {
      fetchClassifications();
    }
  }, [user]);

  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const data = await getClassificationsByUserId(subscriberId);
      setClassifications(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getClassificationById(id);
      setSelectedRow(data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch classification.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This classification will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await deleteClassification(id);
        toast.success("Classification deleted.");
        fetchClassifications();
      } catch (err) {
        toast.error("Failed to delete classification.");
      }
    }
  };

  const handleOpen = () => {
    setSelectedRow(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case StatusEnum.ACTIVE:
        return "success";
      case StatusEnum.INACTIVE:
        return "warning";
      default:
        return "dark";
    }
  };

  const filteredData = classifications.filter((obj) => {
    const values = [
      obj._id?.slice(-6),
      obj.description,
      obj.status,
      new Date(obj.createdAt).toLocaleString(),
    ];

    return values.some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AccessControlWrapper>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Classification"
          levelTwo="Home"
          levelThree="File Maintenance"
        />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <div className="mb-4 text-start">
                      <Button
                        variant="success"
                        onClick={() => setShowModal(true)}
                      >
                        <FaPlus className="mr-1" />
                        Add Classification
                      </Button>
                    </div>

                    <Search
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                      onAdd={handleOpen}
                    />

                    <ClassificationTable
                      loading={loading}
                      currentData={currentData}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      getBadgeClass={getBadgeClass}
                    />

                    <Paginations
                      loading={loading}
                      filteredData={filteredData}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      indexOfFirstItem={indexOfFirstItem}
                      indexOfLastItem={indexOfLastItem}
                      paginate={paginate}
                    />

                    <ClassificationModal
                      show={showModal}
                      onHide={handleClose}
                      selectedRow={selectedRow}
                      refreshList={fetchClassifications}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </AccessControlWrapper>
  );
}

export default FMClassification;
