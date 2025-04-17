import React, { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import ClassificationModal from "../../modals/ClassificationModal";
import TableClassifications from "../../tables/TableClassifications";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const FMClassifications = ({ user, darkMode }) => {
  const [classifications, setClassifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchClassifications();
    }
  }, [user]);

  const fetchClassifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/get-classifications`);
      setClassifications(res.data.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/api/get-classification/${id}`);
      setSelectedRow(res.data.data);
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
        await axios.delete(`${API_URL}/api/delete-classification/${id}`);
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
  const filteredData = classifications.filter((obj) =>
    obj.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Add Classification
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

      <TableClassifications
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

      <ClassificationModal
        show={showModal}
        onHide={handleClose}
        selectedRow={selectedRow}
        refreshList={fetchClassifications}
      />
    </>
  );
};

export default FMClassifications;
