// Dashboard.jsx
import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import FormHeader from "../../commons/FormHeader";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import TableVisitor from "../../tables/TableVisitor";
import VisitorModal from "../../modals/VisitorModal";
import QRCodeForm from "./QRCodeForm";
import { useTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Dashboard = ({ user }) => {
  const { darkMode } = useTheme();

  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [isQRLoading, setQRIsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [txnId, setTxnId] = useState("");
  const [balance, setBalance] = useState(0.0);
  const [proofs, setVisitors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const qrRef = useRef(null);

  useEffect(() => {
    if (user?.userId) {
      fetchUserBalance();
      fetchVisitorByUserId();
    }
  }, [user]);

  useEffect(() => {
    if (qrImageUrl && qrRef.current) {
      qrRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [qrImageUrl]);

  const fetchUserBalance = async () => {
    setQRIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/check-balance/${user.userId}`
      );
      const parsedBalance = parseFloat(res.data?.balance);
      setBalance(isNaN(parsedBalance) ? 0.0 : parsedBalance);
    } catch (error) {
      console.error("Balance fetch error:", error?.response || error);
      toast.error("Failed to fetch balance.");
      setBalance(0.0);
    } finally {
      setQRIsLoading(false);
    }
  };

  const fetchVisitorByUserId = async () => {
    setTableLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/get-visitor-by-user/${user.userId}`
      );
      console.log("Fecth visitors", res.data);
      setVisitors(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch visitor:", err);
    } finally {
      setTableLoading(false);
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

  const generateQR = async () => {
    try {
      const res = await fetch(`${API_URL}/api/generate-qr/${user.userId}`, {
        method: "POST",
      });
      const data = await res.json();
      setQrImageUrl(data.qrImageUrl);
      return true;
    } catch {
      toast.error("QR generation failed.");
      return false;
    }
  };

  const payBalance = async () => {
    try {
      const res = await fetch(`${API_URL}/api/submit-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.userId }),
      });

      const data = await res.json();

      if (res.status === 200) {
        setBalance((prev) => parseFloat(prev) - 100);
        toast.success("₱100.00 has been deducted. Payment successful.");
        return true;
      } else {
        toast.error("Payment failed: " + (data.message || "Unknown error"));
        setQrImageUrl(null);
        return false;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
      setQrImageUrl(null);
      return false;
    }
  };

  const handleGenerateQR = async (visitorTxnId) => {
    if (balance < 100) {
      toast.warning("Your balance is insufficient to generate a QR code.");
      return;
    }

    const result = await Swal.fire({
      title: "Proceed with QR Generation?",
      text: "₱100.00 will be deducted from your balance upon payment.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, generate and pay",
    });

    if (!result.isConfirmed) return;

    setQRIsLoading(true);
    try {
      const qrGenerated = await generateQR();
      if (qrGenerated) {
        const paid = await payBalance();
        if (paid) {
          setTxnId(visitorTxnId);
        }
      }
    } catch (error) {
      console.error("QR/Payment process failed:", error);
    } finally {
      setQRIsLoading(false);
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
      : Math.ceil(filteredData.length / itemsPerPageValue);

  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";

  return (
    <Container className="mt-6">
      <FormHeader
        levelOne="Home"
        levelTwo="Dashboard"
        levelThree={user?.name?.split(" ")[0]}
      />

      <Row className="justify-content-center">
        <Col md={8} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body className="main-card">
              <h4 className="text-center mb-4">
                Current Balance: ₱{parseFloat(balance).toFixed(2)}
              </h4>

              <div className="mb-4 text-start">
                <Button
                  variant="success"
                  onClick={() => setShowVisitorModal(true)}
                >
                  <FaPlus className="me-2" />
                  Add Visitor
                </Button>
              </div>

              <FormSearch
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
                setCurrentPage={setCurrentPage}
              />

              <TableVisitor
                tableLoading={tableLoading}
                currentData={currentData}
                darkMode={darkMode}
                getBadgeClass={getBadgeClass}
                onGenerateQRClick={handleGenerateQR}
              />

              <FormPagination
                tableLoading={tableLoading}
                filteredData={filteredData}
                currentPage={currentPage}
                totalPages={totalPages}
                indexOfFirstItem={indexOfFirstItem}
                indexOfLastItem={indexOfLastItem}
                paginate={setCurrentPage}
                darkMode={darkMode}
              />

              <VisitorModal
                user={user}
                show={showVisitorModal}
                onHide={() => setShowVisitorModal(false)}
                refreshList={fetchVisitorByUserId}
              />

              {qrImageUrl && txnId && (
                <div ref={qrRef}>
                  <QRCodeForm
                    qrCode={qrImageUrl}
                    txnId={txnId}
                    isLoading={isQRLoading}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
