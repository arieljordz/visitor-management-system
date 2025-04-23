import React, { useEffect, useState } from "react";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import { Row, Col, Card } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Navpath from "../../components/common/Navpath";
import QRCodeModal from "../../components/transactions/modals/QRCodeModal";
import GeneratedQRCodeTable from "../../components/transactions/tables/GeneratedQRCodeTable";

const API_URL = import.meta.env.VITE_BASE_API_URL;

function GeneratedQRCodes({ user, setUser }) {
  const [generatedQRs, setGeneratedQRs] = useState([]);
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
      fetchGeneratedQRs();
    }
  }, [user]);

  const fetchGeneratedQRs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/get-generated-qr/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      // console.log("Fetched GeneratedQRs:", res.data);
      const fetchedData = res.data.data || [];
      setGeneratedQRs(fetchedData);
    } catch (err) {
      console.error("Failed to fetch generatedQRs:", err);
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

  // Filter generatedQRs by search term
  const filteredData = generatedQRs.filter((txn) => {
    const values = [
      txn._id?.slice(-6),
      txn.transaction,
      txn.amount?.toString(),
      txn.paymentMethod,
      new Date(txn.paymentDate).toLocaleString(),
      txn.status,
      txn.visitorId?.firstName,
      txn.visitorId?.lastName,
      txn.visitorId?.groupName,
      txn.visitorId?.purpose,
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

  // Slice generatedQRs accordingly
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle QR code modal view
  const handleViewQRCode = (imageUrl, txnId) => {
    setQrImageUrl(imageUrl);
    setTxnId(txnId);
    setShowModal(true);
  };

  return (
    <div>
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

export default GeneratedQRCodes;
