import React, { useEffect, useState } from "react";
import { Button, Card, Row, Col } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import PaymentMethodTable from "../../components/fileMaintenance/tables/PaymentMethodTable";
import PaymentMethodModal from "../../components/fileMaintenance/modals/PaymentMethodModal";
import {
  getPaymentMethods,
  getPaymentMethodById,
  deletePaymentMethod,
} from "../../services/paymentMethodService.js";
import { StatusEnum } from "../../enums/enums.js";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function FMPaymentMethod() {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchPaymentMethod();
    }
  }, [user]);

  const fetchPaymentMethod = async () => {
    setLoading(true);
    try {
      const data = await getPaymentMethods();
      // console.log("Fetch payment-method:", data);
      setPaymentMethod(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getPaymentMethodById(id);
      setSelectedRow(data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch payment-method.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Payment method will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await deletePaymentMethod(id);
        toast.success("Payment method deleted.");
        fetchPaymentMethod();
      } catch (err) {
        toast.error("Failed to delete Payment method.");
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

  const filteredData = paymentMethod.filter((obj) => {
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
          levelOne="Payment Method"
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
                        Add Payment Method
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

                    <PaymentMethodTable
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

                    <PaymentMethodModal
                      show={showModal}
                      onHide={handleClose}
                      selectedRow={selectedRow}
                      refreshList={fetchPaymentMethod}
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

export default FMPaymentMethod;
