import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VerificationsTable from "../../components/verifications/tables/VerificationsTable";
import ProofsModal from "../../components/verifications/modals/ProofsModal";
import {
  getPaymentProofs,
  updateVerificationStatus,
} from "../../services/paymentDetailService.js";

function Verifications({ user, setUser }) {
  const [proofs, setProofs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

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
      const data = await getPaymentProofs();
      setProofs(data);
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
    const result = await Swal.fire({
      title: "Verification",
      text: `Are you sure you want to ${verificationStatus} this payment?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${verificationStatus} it`,
      cancelButtonText: "Cancel",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await updateVerificationStatus(id, verificationStatus);
        toast.success(`Payment ${verificationStatus} successfully.`);
        fetchProofs(); // Refresh payment list
      } catch (err) {
        toast.error(`Payment ${verificationStatus} failed.`);
        console.error(err);
      }
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
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Verifications"
          levelTwo="Home"
          levelThree="Verifications"
        />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    {/* Search and Items per page */}
                    <Search
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                    />

                    {/* Table */}
                    <VerificationsTable
                      loading={loading}
                      currentData={currentData}
                      handleViewProofImage={handleViewProofImage}
                      handleVerification={handleVerification}
                      getBadgeClass={getBadgeClass}
                    />

                    {/* Pagination + Count */}
                    <Paginations
                      loading={loading}
                      filteredData={filteredData}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      indexOfFirstItem={indexOfFirstItem}
                      indexOfLastItem={indexOfLastItem}
                      paginate={paginate}
                    />
                    {/* Modal to view the Proof */}
                    <ProofsModal
                      show={showModal}
                      setShowModal={setShowModal}
                      imageProof={imageProof}
                      txnId={txnId}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Verifications;
