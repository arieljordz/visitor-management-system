import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import ProofsTable from "../../components/fileMaintenance/tables/ProofsTable";
import ProofsModal from "../../components/verifications/modals/ProofsModal";
import { getPaymentProofs } from "../../services/paymentDetailService.js";
import { PaymentStatusEnum } from "../../enums/enums.js";

function FMProofs({ user }) {
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
      const data = await getPaymentProofs();
      // console.log("Fetched Proofs:", data);
      setProofs(data);
    } catch (err) {
      console.error("Failed to fetch proofs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case PaymentStatusEnum.COMPLETED:
        return "success";
      case PaymentStatusEnum.PENDING:
        return "warning";
      case PaymentStatusEnum.FAILED:
        return "danger";
      case PaymentStatusEnum.CANCELLED:
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
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Proofs"
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
                    {/* Search and Items per page */}
                    <Search
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                    />

                    {/* Table */}
                    <ProofsTable
                      loading={loading}
                      currentData={currentData}
                      handleViewProofImage={handleViewProofImage}
                      getBadgeClass={getBadgeClass}
                      refreshList={fetchProofs}
                    />

                    {/* Pagination + Count */}
                    <Paginations
                      loading={loading}
                      filteredData={filteredProofs}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      indexOfFirstItem={indexOfFirstItem}
                      indexOfLastItem={indexOfLastItem}
                      paginate={paginate}
                    />

                    {/* Modal to view the Proof*/}
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

export default FMProofs;
