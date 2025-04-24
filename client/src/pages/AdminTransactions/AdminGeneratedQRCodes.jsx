import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Card, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import AdminGeneratedQRCodeTable from "../../components/adminTransactions/tables/AdminGeneratedQRCodeTable";
import QRCodeModal from "../../components/adminTransactions/modals/QRCodeModal";
import { getGeneratedQRCodes } from "../../services/qrService.js";

function AdminGeneratedQRCodes({ user, setUser }) {
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
      const data = await getGeneratedQRCodes();
      // console.log("Fetched qRCodes:", data);
      setQRCodes(data);
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
                    <AdminGeneratedQRCodeTable
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

export default AdminGeneratedQRCodes;
