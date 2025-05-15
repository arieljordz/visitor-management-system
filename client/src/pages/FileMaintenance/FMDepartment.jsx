import React, { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext.jsx";
import Navpath from "../../components/common/Navpath.jsx";
import Search from "../../components/common/Search.jsx";
import Paginations from "../../components/common/Paginations.jsx";
import DepartmentTable from "../../components/fileMaintenance/tables/DepartmentTable.jsx";
import DepartmentModal from "../../components/fileMaintenance/modals/DepartmentModal.jsx";
import {
  getDepartments,
  getDepartmentById,
  deleteDepartment,
} from "../../services/departmentService.js";
import { StatusEnum } from "../../enums/enums.js";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function FMDepartment() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getDepartmentById(id);
      setSelectedRow(data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch Department.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Department will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await deleteDepartment(id);
        toast.success("Department deleted.");
        fetchDepartments();
      } catch (err) {
        toast.error("Failed to delete Department.");
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

  const filteredData = departments.filter((obj) => {
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
          levelOne="Department"
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
                        Add Department
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

                    <DepartmentTable
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

                    <DepartmentModal
                      show={showModal}
                      onHide={handleClose}
                      selectedRow={selectedRow}
                      refreshList={fetchDepartments}
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

export default FMDepartment;
