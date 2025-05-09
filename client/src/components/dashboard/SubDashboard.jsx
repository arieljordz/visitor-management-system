import React, { useState, useEffect } from "react";
import { Button, Row, Col, Card, Spinner } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSpinner } from "../../context/SpinnerContext";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import Swal from "sweetalert2";

import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import VisitorsTable from "../../components/dashboard/tables/VisitorsTable";
import VisitorsModal from "../../components/dashboard/modals/VisitorsModal";
import QRCodeModal from "../../components/dashboard/modals/QRCodeModal";
import SubDashboardStats from "./SubDashboardStats.jsx";

import { getVisitorByUserId } from "../../services/visitorService.js";
import {
  generateQRCodeWithPayment,
  generateQRCodeSubscription,
  checkActiveQRCodeForVisit,
} from "../../services/qrService.js";
import { getBalance } from "../../services/balanceService.js";
import { getFeeByCodeAndStatus } from "../../services/feeService.js";
import { FeeCodeEnum, QRStatusEnum } from "../../enums/enums.js";

const SubDashboard = ({ user }) => {
  const { setLoading } = useSpinner();
  const { flags } = useFeatureFlags();
  const [proofs, setVisitors] = useState([]);
  const [txnId, setTxnId] = useState("");
  const [qrViewImageUrl, setViewQrImageUrl] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    setTableLoading(true);
    try {
      const data = await getVisitorByUserId(user.userId);
      // console.log("Fetch visitors", data);
      setVisitors(data);
    } catch (err) {
      // console.error("Failed to fetch visitor:", err);
    } finally {
      setTableLoading(false);
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

  const handleGenerateQR = async (visitorId, visitdetailsId) => {
    try {
      if (!await canGenerateQRCode()) return;
  
      const conflict = await checkActiveQRCodeForVisit(user, visitorId, visitdetailsId);
      if (conflict) {
        toast.warning(conflict.message);
        return;
      }
  
      const confirm = await confirmQRGeneration();
      if (!confirm) return;
  
      setLoading(true);
  
      const generateFn = flags.enableSubscriptions 
        ? generateQRCodeSubscription 
        : generateQRCodeWithPayment;
  
      await generateFn({ userId: user.userId, visitorId, visitdetailsId });
  
      toast.success("Successfully generated QR code for the visitor.");
      fetchVisitors();
  
    } catch (error) {
      console.error("Generation of QR failed:", error);
      toast.warning(error.response?.data?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };
  
  const canGenerateQRCode = async () => {
    if (flags.enableSubscriptions) return true;
  
    const fee = await getFeeByCodeAndStatus(FeeCodeEnum.GENQR01);
    const data = await getBalance(user.userId);
    const currentBalance = parseFloat(data?.balance || "0");
  
    if (currentBalance < fee.fee) {
      toast.warning("Your balance is insufficient to generate a QR code.");
      return false;
    }
  
    return true;
  };
  
  const confirmQRGeneration = async () => {
    const result = await Swal.fire({
      title: "Proceed with QR Generation?",
      text: "This will generated a QR code for the specific visitor.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, generate it",
    });
  
    return result.isConfirmed;
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
          {dashboardLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <SubDashboardStats user={user} />
          )}
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

export default SubDashboard;
