import React, { useState, useEffect, useRef } from "react";
import { Button, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VisitorsTable from "../../components/dashboard/tables/VisitorsTable";
import VisitorsModal from "../../components/dashboard/modals/VisitorsModal";
import DisplayQRCode from "../../components/dashboard/DisplayQRCode";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const Dashboard = ({ user, setUser }) => {
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
      // toast.error("Failed to fetch balance.");
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
  return (
    <div className="content-wrapper">
      {/* Content Header */}
      <Navpath levelOne="Dashboard" levelTwo="Home" levelThree="Dashboard" />

      {/* Main content */}
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Info Box 1 */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>150</h3>
                  <p>New Orders</p>
                </div>
                <div className="icon">
                  <i className="ion ion-bag" />
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>

            {/* Info Box 2 */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>
                    53<sup style={{ fontSize: 20 }}>%</sup>
                  </h3>
                  <p>Bounce Rate</p>
                </div>
                <div className="icon">
                  <i className="ion ion-stats-bars" />
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>

            {/* Info Box 3 */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>44</h3>
                  <p>User Registrations</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-add" />
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>

            {/* Info Box 4 */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-danger">
                <div className="inner">
                  <h3>65</h3>
                  <p>Unique Visitors</p>
                </div>
                <div className="icon">
                  <i className="ion ion-pie-graph" />
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right" />
                </a>
              </div>
            </div>
          </div>
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card className={`shadow`}>
                <Card.Body className="main-card">
                  <div className="mb-4 text-start">
                    <Button
                      variant="success"
                      onClick={() => setShowVisitorModal(true)}
                    >
                      <FaPlus className="me-2" />
                      Add Visitor
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
                    refreshList={fetchVisitorByUserId}
                  />

                  {qrImageUrl && txnId && (
                    <div ref={qrRef}>
                      <DisplayQRCode
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
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
