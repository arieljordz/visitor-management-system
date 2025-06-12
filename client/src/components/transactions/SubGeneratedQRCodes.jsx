import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import Search from "../common/Search.jsx";
import Paginations from "../common/Paginations.jsx";
import { Row, Col, Card } from "react-bootstrap";
import Navpath from "../common/Navpath.jsx";
import QRCodeModal from "./modals/QRCodeModal.jsx";
import GeneratedQRCodeTable from "./tables/GeneratedQRCodeTable.jsx";
import { getGeneratedQRCodesById } from "../../services/qrService.js";
import { QRStatusEnum } from "../../enums/enums.js";
import AccessControlWrapper from "../common/AccessControlWrapper.jsx";

function SubGeneratedQRCodes() {
  const { user } = useAuth();
  const [generatedQRs, setGeneratedQRs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [txnId, setTxnId] = useState("");
  const [visitorName, setVisitorName] = useState("");

  useEffect(() => {
    if (user?.userId) {
      fetchGeneratedQRs();
    }
  }, [user]);

  const fetchGeneratedQRs = async () => {
    setLoading(true);
    try {
      const data = await getGeneratedQRCodesById(user.userId);
      // console.log("Fetched GeneratedQRs:", data);
      setGeneratedQRs(data);
    } catch (err) {
      console.error("Failed to fetch generatedQRs:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case QRStatusEnum.PENDING:
        return "warning";
      case QRStatusEnum.ACTIVE:
        return "success";
      case QRStatusEnum.USED:
        return "primary";
      case QRStatusEnum.EXPIRED:
        return "danger";
      default:
        return "dark";
    }
  };

  // Filter generatedQRs by search term
  const filteredData = generatedQRs.filter((txn) => {
    const fullName = `${txn.visitorId?.firstName || ""} ${
      txn.visitorId?.lastName || ""
    }`.trim();

    const values = [
      txn._id?.slice(-6),
      txn.transaction,
      txn.amount?.toString(),
      txn.paymentMethod,
      new Date(txn.paymentDate).toLocaleString(),
      txn.status,
      txn.visitorId?.firstName,
      txn.visitorId?.lastName,
      fullName,
      txn.visitorId?.groupName,
      txn.visitorId?.purpose,
      txn.visitorId?.visitorType,
      txn.userId?.name,
    ];

    return values.some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Determine actual items per page
  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  // Calculate indices based on itemsPerPageValue
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  // Slice generatedQRs accordingly
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle QR code modal view
  const handleViewQRCode = (imageUrl, visitorName, txnId) => {
    setQrImageUrl(imageUrl);
    setVisitorName(visitorName);
    setTxnId(txnId);
    setShowModal(true);
  };

  return (
    <AccessControlWrapper>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Generated QR Codes"
          levelTwo="Home"
          levelThree="Transactions"
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
                    <GeneratedQRCodeTable
                      loading={loading}
                      currentData={currentData}
                      handleViewQRCode={handleViewQRCode}
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
                    {/* Modal to view the QR code */}
                    <QRCodeModal
                      show={showModal}
                      setShowModal={setShowModal}
                      qrImageUrl={qrImageUrl}
                      txnId={txnId}
                      visitorName={visitorName}
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

export default SubGeneratedQRCodes;
