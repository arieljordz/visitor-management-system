import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import ProofModal from "../../modals/ProofModal";
import TableProofs from "../../tables/TableProofs";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const FMProofs = ({ user, darkMode }) => {
  const [proofs, setProofs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [imageProof, setImageProof] = useState("");
  const [txnId, setTxnId] = useState("");

  useEffect(() => {
    if (user?.userId) {
      fetchProofs();
    }
  }, [user]);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/get-payment-proofs`);
      console.log("Fetched Proofs:", res.data.data);
      const fetchedData = res.data.data || [];
      setProofs(fetchedData);
    } catch (err) {
      console.error("Failed to fetch proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "cancelled":
        return "secondary";
      default:
        return "dark";
    }
  };

  // Filter proofs by search term
  const filteredProofs = proofs.filter((obj) => {
    const values = [
      obj._id?.slice(-6),
      obj.transaction,
      obj.amount?.toString(),
      obj.paymentMethod,
      obj.proofOfPayment,
      new Date(obj.paymentDate).toLocaleString(),
      obj.status,
    ];
    return values.some((val) =>
      val?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Determine actual items per page
  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredProofs.length : itemsPerPage;

  // Calculate indices based on itemsPerPageValue
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  // Slice proofs accordingly
  const currentData = filteredProofs.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredProofs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleViewProofImage = (imageUrl, txnId) => {
    setImageProof(imageUrl);
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
      <TableProofs
        loading={loading}
        currentData={currentData}
        darkMode={darkMode}
        handleViewProofImage={handleViewProofImage}
        getBadgeClass={getBadgeClass}
        refreshList={fetchProofs}
      />

      {/* Pagination + Count */}
      <FormPagination
        loading={loading}
        filteredData={filteredProofs}
        currentPage={currentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        paginate={paginate}
        darkMode={darkMode}
      />

      {/* Modal to view the Proof*/}
      <ProofModal
        show={showModal}
        setShowModal={setShowModal}
        imageProof={imageProof}
        txnId={txnId}
      />
    </>
  );
};

export default FMProofs;
