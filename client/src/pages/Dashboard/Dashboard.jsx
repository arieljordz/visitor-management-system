import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VisitorsTable from "../../components/dashboard/tables/VisitorsTable";
import VisitorsModal from "../../components/dashboard/modals/VisitorsModal";
import QRCodeModal from "../../components/dashboard/modals/QRCodeModal";
import DashboardStats from "./DashboardStats.jsx";

import { getVisitorByUserId } from "../../services/visitorService.js";
import {
  checkActiveQRCodeById,
  generateQRCodeWithPayment,
} from "../../services/qrService.js";
import { getBalance } from "../../services/balanceService.js";

const Dashboard = ({ user }) => {
  const [proofs, setVisitors] = useState([]);
  const [balance, setBalance] = useState(0.0);
  const [txnId, setTxnId] = useState("");
  const [qrViewImageUrl, setViewQrImageUrl] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchVisitors();
      fetchBalance();
    }
  }, [user]);

  const fetchVisitors = async () => {
    setTableLoading(true);
    try {
      const data = await getVisitorByUserId(user.userId);
      console.log("Fetch visitors", data);
      setVisitors(data);
    } catch (err) {
      // console.error("Failed to fetch visitor:", err);
    } finally {
      setTableLoading(false);
    }
  };

  const fetchBalance = async () => {
    try {
      const data = await getBalance(user.userId);
      // console.log("data:", data);
      const parsedBalance = parseFloat(data?.balance);
      const safeBalance = isNaN(parsedBalance) ? 0.0 : parsedBalance;
      setBalance(safeBalance);
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance(0.0);
    }
  };

  const getBadgeClass = (status) => {
    const s = status?.toLowerCase();
    return (
      {
        verified: "success",
        pending: "warning",
        declined: "danger",
      }[s] || "dark"
    );
  };

  const checkActiveQR = async (visitorId) => {
    try {
      const data = await checkActiveQRCodeById(user, visitorId);
      return data ?? null;
    } catch (error) {
      // console.error("Failed to check active QR code:", error);
      return null;
    }
  };

  const handleGenerateQR = async (visitorId) => {
    try {
      if (balance < 20) {
        toast.warning("Your balance is insufficient to generate a QR code.");
        return;
      }

      const hasActiveQR = await checkActiveQR(visitorId);
      if (hasActiveQR) {
        toast.warning("This visitor currently has an active QR code.");
        return;
      }

      const result = await Swal.fire({
        title: "Proceed with QR Generation?",
        text: "The generation of a QR code will initiate a deduction from your available balance.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, generate it",
      });

      if (!result.isConfirmed) return;

      const response = await generateQRCodeWithPayment({
        userId: user.userId,
        visitorId,
      });

      // console.log("response:", response);

      toast.success("Your payment was successful and the QR code is ready.");
      fetchVisitors();
      fetchBalance();
    } catch (error) {
      console.error("QR/Payment process failed:", error);
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
      txn.visitorType,
      txn.firstName,
      txn.lastName,
      txn.groupName,
      txn.purpose,
      txn.classification,
      txn.visitDate,
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
      : Math.ceil(filteredData.length / itemsPerPageValue);

  const handleViewQRCode = (imageUrl, txnId) => {
    setViewQrImageUrl(imageUrl);
    setTxnId(txnId);
    setShowModal(true);
  };

  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <DashboardStats user={user} />

          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card className="shadow">
                <Card.Body className="main-card">
                  <div className="mb-4 text-start">
                    <Button
                      variant="success"
                      onClick={() => setShowVisitorModal(true)}
                    >
                      <FaPlus className="mr-1" /> Add Visitor
                    </Button>
                  </div>

                  <Search
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    setCurrentPage={setCurrentPage}
                  />

                  <VisitorsTable
                    tableLoading={tableLoading}
                    currentData={currentData}
                    getBadgeClass={getBadgeClass}
                    onGenerateQRClick={handleGenerateQR}
                    handleViewQRCode={handleViewQRCode}
                  />

                  <Paginations
                    tableLoading={tableLoading}
                    filteredData={filteredData}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    indexOfFirstItem={indexOfFirstItem}
                    indexOfLastItem={indexOfLastItem}
                    paginate={setCurrentPage}
                  />

                  <VisitorsModal
                    user={user}
                    show={showVisitorModal}
                    onHide={() => setShowVisitorModal(false)}
                    refreshList={fetchVisitors}
                  />

                  <QRCodeModal
                    show={showModal}
                    setShowModal={setShowModal}
                    qrImageUrl={qrViewImageUrl}
                    txnId={txnId}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
