import React, { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import PaymentMethodModal from "../../modals/PaymentMethodModal";
import TablePaymentMethod from "../../tables/TablePaymentMethod";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const FMPaymentMethod = ({ user, darkMode }) => {
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
      const res = await axios.get(`${API_URL}/api/get-payment-methods`);
      console.log("Fetch payment-method:", res.data.data);
      setPaymentMethod(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/get-payment-method/${id}`);
      setSelectedRow(res.data.data);
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
        await axios.delete(`${API_URL}/api/delete-payment-method/${id}`);
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
  
  const filteredData = paymentMethod.filter((obj) => {
    const values = [
      obj._id?.slice(-6),
      obj.method,
      obj.accountName,
      obj.accountNumber,
      obj.bankName,
      new Date(obj.createdAt).toLocaleString(),
    ];
  
    return values.some((val) =>
      val?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  

  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;
  const currentData = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <div className="mb-4 text-start">
        <Button variant="success" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" />
          Add Payment Method
        </Button>
      </div>

      <FormSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
        onAdd={handleOpen}
      />

      <TablePaymentMethod
        loading={loading}
        currentData={currentData}
        darkMode={darkMode}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />

      <FormPagination
        loading={loading}
        filteredData={filteredData}
        currentPage={currentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        paginate={paginate}
        darkMode={darkMode}
      />

      <PaymentMethodModal
        show={showModal}
        onHide={handleClose}
        selectedRow={selectedRow}
        refreshList={fetchPaymentMethod}
      />
    </>
  );
};

export default FMPaymentMethod;
