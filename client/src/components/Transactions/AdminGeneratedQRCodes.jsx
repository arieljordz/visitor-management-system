import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import TableAdminGeneratedCodes from "../../tables/TableAdminGeneratedCodes";
import QRCodeModal from "../../modals/QRCodeModal";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const AdminGeneratedQRCodes = ({ user, darkMode }) => {
  const [qRCodes, setQRCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    if (user?.userId) {
      fetchQRCodes();
    }
  }, [user]);

  const fetchQRCodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/get-generated-qr`);
      console.log("Fetched qRCodes:", res);
      const fetchedData = res.data.data || [];
      setQRCodes(fetchedData);
    } catch (err) {
      console.error("Failed to fetch qRCodes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success";
      case "used":
        return "warning";
      case "expired":
        return "danger";
      default:
        return "dark";
    }
  };

  // Filter qRCodes by search term
  const filteredData = qRCodes.filter((txn) => {
    const values = [
      txn._id?.slice(-6),
      txn.transaction,
      txn.amount?.toString(),
      txn.paymentMethod,
      new Date(txn.paymentDate).toLocaleString(),
      txn.status,
    ];
    return values.some((val) =>
      val?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Determine actual items per page
  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  // Calculate indices based on itemsPerPageValue
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  // Slice qRCodes accordingly
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewQRCode = (imageUrl, txnId) => {
    setQrImageUrl(imageUrl);
    setTxnId(txnId);
    setShowModal(true);
  };

  return (
    <>
      {/* Search and Items per page */}
      <FormSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Table */}
      <TableAdminGeneratedCodes
        loading={loading}
        currentData={currentData}
        darkMode={darkMode}
        handleViewQRCode={handleViewQRCode}
        getBadgeClass={getBadgeClass}
      />

      {/* Pagination + Count */}
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
      {/* Modal to view the QR code */}
      <QRCodeModal
        show={showModal}
        setShowModal={setShowModal}
        qrImageUrl={qrImageUrl}
        txnId={txnId}
      />
    </>
  );
};

export default AdminGeneratedQRCodes;
