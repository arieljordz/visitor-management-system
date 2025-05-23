import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VerificationsTable from "../../components/verifications/tables/VerificationsTable";
import ProofsModal from "../../components/verifications/modals/ProofsModal";
import {
  getPaymentProofs,
  updateVerificationStatus,
  updateSubscriptionStatus,
} from "../../services/paymentDetailService.js";
import { VerificationStatusEnum } from "../../enums/enums.js";

function Verifications() {
  const { user } = useAuth();
  const { refreshDashboard } = useDashboard();
  const { flags } = useFeatureFlags();
  const [proofs, setProofs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
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
      case VerificationStatusEnum.VERIFIED:
        return "success";
      case VerificationStatusEnum.PENDING:
        return "warning";
      case VerificationStatusEnum.DECLINED:
        return "danger";
      default:
        return "dark";
    }
  };

  const handleViewProofImage = (imageUrl, txnId) => {
    setImageUrl(imageUrl);
    setTxnId(txnId);
    setShowModal(true);
  };

  const handleVerification = async (id, status, verificationStatus) => {
    if (status === "pending") {
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
        let reason = "";
        if (verificationStatus === "declined") {
          const { value: inputReason } = await Swal.fire({
            title: "Reason for Decline",
            input: "text",
            inputLabel: "Please provide a reason for declining",
            inputPlaceholder: "Enter reason here...",
            inputValidator: (value) => {
              if (!value) {
                return "You must enter a reason!";
              }
            },
          });

          if (!inputReason) return;

          reason = inputReason;
        }

        try {
          const handler = flags.enableSubscriptions
            ? updateSubscriptionStatus
            : updateVerificationStatus;

          await handler(id, verificationStatus, reason);

          toast.success(`Payment ${verificationStatus} successfully.`);
          refreshDashboard();
          fetchProofs();
        } catch (err) {
          toast.error(err.response?.data?.message || "Something went wrong.");
          console.error(err);
        }
      }
    } else {
      toast.info(`This Payment is already been ${status}.`);
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
      txn.userId?.name,
      txn.verificationStatus,
      txn.referenceNumber,
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
                      imageUrl={imageUrl}
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
