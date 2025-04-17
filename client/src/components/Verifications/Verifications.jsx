import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { useTheme } from "../../context/ThemeContext";
import FormHeader from "../../commons/FormHeader";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import TableVerification from "../../tables/TableVerification";
import ProofModal from "../../modals/ProofModal";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Verifications = ({ user }) => {
  const { darkMode } = useTheme();
  const [proofs, setProofs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [imageProof, setImageProof] = useState("");
  const [txnId, setTxnId] = useState("");

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  useEffect(() => {
    if (user?.userId) {
      fetchProofs();
    }
  }, [user]);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/get-payment-proofs`);
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
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "declined":
        return "danger";
      default:
        return "dark";
    }
  };

  const handleViewProofImage = (imageUrl, txnId) => {
    setImageProof(imageUrl);
    setTxnId(txnId);
    setShowModal(true);
  };

  const handleVerification = async (id, verificationStatus) => {
    try {
      await axios.put(`${API_URL}/api/update-verification/${id}`, {
        verificationStatus,
      });
  
      toast.success(`Payment ${verificationStatus} successfully`);
      fetchProofs(); // Refresh data
    } catch (err) {
      toast.error(`Payment ${verificationStatus} failed`);
      console.error(err);
    }
  };
  
  const filteredData = proofs.filter((txn) => {
    const values = [
      txn._id?.slice(-6),
      txn.transaction,
      txn.amount?.toString(),
      txn.paymentMethod,
      txn.proofOfPayment,
      new Date(txn.paymentDate).toLocaleString(),
      txn.status,
    ];
    return values.some((val) =>
      val?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Container className="mt-6">
        <FormHeader
          levelOne="Home"
          levelTwo="Verifications"
          levelThree={user?.name?.split(" ")[0]}
        />
        <Row className="justify-content-center">
          <Col md={8} lg={12}>
            <Card className={`shadow ${cardClass}`}>
              <Card.Body className="main-card">
                {/* Search and Items per page */}
                <FormSearch
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  itemsPerPage={itemsPerPage}
                  setItemsPerPage={setItemsPerPage}
                  setCurrentPage={setCurrentPage}
                />

                {/* Table */}
                <TableVerification
                  loading={loading}
                  currentData={currentData}
                  darkMode={darkMode}
                  handleViewProofImage={handleViewProofImage}
                  handleVerification={handleVerification}
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
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Modal to view the Proof */}
      <ProofModal
        show={showModal}
        setShowModal={setShowModal}
        imageProof={imageProof}
        txnId={txnId}
      />
    </>
  );
};

export default Verifications;
