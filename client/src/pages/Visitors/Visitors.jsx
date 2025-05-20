import React, { useEffect, useState } from "react";
import { Button, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VisitorsTable from "../../components/visitors/tables/VisitorsTable";
import VisitorsModal from "../../components/visitors/modals/VisitorsModal";
import {
  getVisitorByUserId,
  getVisitorDetailById,
  deleteVisitDetail,
} from "../../services/visitorService.js";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function Visitors() {
  const { user } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    try {
      const data = await getVisitorByUserId(user.userId);

      setVisitors(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getVisitorDetailById(id);
      setSelectedRow(data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch visitor details.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This record will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await deleteVisitDetail(id);
        toast.success("Successfully deleted record.");
        fetchVisitors();
      } catch (err) {
        toast.error("Failed to delete record.");
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

  const filteredData = visitors.filter((obj) => {
    const values = [
      obj._id?.slice(-6),
      obj.email,
      obj.name,
      obj.role,
      obj.address,
      obj.status,
      obj.department,
      obj.categoryType,
      obj.subscription,
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
        <Navpath levelOne="Visitors" levelTwo="Home" levelThree="Visitors" />

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
                        Add Visitor
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

                    <VisitorsTable
                      loading={loading}
                      currentData={currentData}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
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

                    <VisitorsModal
                      show={showModal}
                      onHide={handleClose}
                      selectedRow={selectedRow}
                      refreshList={fetchVisitors}
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

export default Visitors;
