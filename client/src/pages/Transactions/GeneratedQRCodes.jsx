import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Spinner,
  Form,
  InputGroup,
  Table,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import Navpath from "../../components/common/Navpath";
import QRCodeModal from "../../components/transactions/modals/QRCodeModal";

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
        `${API_URL}/api/get-generated-qr/${user.userId}`
      );
      console.log("Fetched GeneratedQRs:", res.data);
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
  const filteredGeneratedQRs = generatedQRs.filter((txn) => {
    const values = [
      txn._id?.slice(-6),
      txn.transaction,
      txn.amount?.toString(),
      txn.paymentMethod,
      new Date(txn.paymentDate).toLocaleString(),
      txn.status,
    ];
    return values.some((val) =>
      val?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Determine actual items per page
  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredGeneratedQRs.length : itemsPerPage;

  // Calculate indices based on itemsPerPageValue
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  // Slice generatedQRs accordingly
  const currentGeneratedQRs = filteredGeneratedQRs.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredGeneratedQRs.length / itemsPerPage);

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
                    <Row className="mb-3 align-items-center">
                      <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                        <InputGroup>
                          <InputGroup.Text>🔍</InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setCurrentPage(1);
                            }}
                          />
                        </InputGroup>
                      </Col>

                      <Col xs={12} sm={6} className="text-sm-end">
                        <Form.Select
                          value={itemsPerPage}
                          className="form-control"
                          onChange={(e) => {
                            const value =
                              e.target.value === "All"
                                ? "All"
                                : parseInt(e.target.value);
                            setItemsPerPage(value);
                            setCurrentPage(1);
                          }}
                          style={{ maxWidth: "150px", marginLeft: "auto" }}
                        >
                          {[5, 10, 20, 50].map((option) => (
                            <option key={option} value={option}>
                              Show {option}
                            </option>
                          ))}
                          <option value="All">Show All</option>
                        </Form.Select>
                      </Col>
                    </Row>

                    {loading ? (
                      <div className="text-center my-4">
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <Table striped bordered hover className="mb-0">
                          <thead>
                            <tr>
                              <th className="text-center">#</th>
                              <th>TransactionID</th>
                              <th className="text-center">QR Code</th>
                              <th>Generated Date</th>
                              <th className="text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentGeneratedQRs.length > 0 ? (
                              currentGeneratedQRs.map((txn, index) => (
                                <tr key={txn._id}>
                                  <td className="text-center">{index + 1}</td>
                                  <td>{txn._id.slice(-6).toUpperCase()}</td>
                                  <td className="text-center">
                                    {/* Check if qrImageUrl exists and render the image */}
                                    {txn.qrImageUrl ? (
                                      <span
                                        className="text-primary cursor-pointer"
                                        onClick={() =>
                                          handleViewQRCode(
                                            txn.qrImageUrl,
                                            txn._id.slice(-6).toUpperCase()
                                          )
                                        }
                                      >
                                        View QR Code
                                      </span>
                                    ) : (
                                      "No QR Image"
                                    )}
                                  </td>
                                  <td>
                                    {txn.createdAt
                                      ? new Date(txn.createdAt).toLocaleString()
                                      : "—"}
                                  </td>
                                  <td className="text-center">
                                    <span
                                      className={`badge bg-${getBadgeClass(
                                        txn.status
                                      )}`}
                                    >
                                      {txn.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan="5"
                                  className={`text-center text-muted`}
                                >
                                  No records found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>
                    )}

                    {!loading && filteredGeneratedQRs.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-3 flex-column flex-sm-row gap-2">
                        <div className={`text-muted`}>
                          Showing{" "}
                          {filteredGeneratedQRs.length === 1
                            ? "1 row"
                            : `${indexOfFirstItem + 1}–${Math.min(
                                indexOfLastItem,
                                filteredGeneratedQRs.length
                              )} rows`}{" "}
                          out of{" "}
                          {filteredGeneratedQRs.length === 1
                            ? "1 entry"
                            : `${filteredGeneratedQRs.length} entries`}
                        </div>

                        {totalPages > 1 && (
                          <Pagination className="mb-0">
                            <Pagination.Prev
                              onClick={() =>
                                currentPage > 1 && paginate(currentPage - 1)
                              }
                              disabled={currentPage === 1}
                            />
                            {[...Array(totalPages)].map((_, i) => (
                              <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => paginate(i + 1)}
                              >
                                {i + 1}
                              </Pagination.Item>
                            ))}
                            <Pagination.Next
                              onClick={() =>
                                currentPage < totalPages &&
                                paginate(currentPage + 1)
                              }
                              disabled={currentPage === totalPages}
                            />
                          </Pagination>
                        )}
                      </div>
                    )}
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
