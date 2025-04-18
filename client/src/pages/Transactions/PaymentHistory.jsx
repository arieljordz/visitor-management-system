import React, { useEffect, useState } from "react";
import Navpath from "../../components/common/Navpath";
import {
  Card,
  Row,
  Col,
  Spinner,
  Form,
  InputGroup,
  Table,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_BASE_API_URL;

function PaymentHistory({ user, setUser }) {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/get-payment-details/${user.userId}`
      );
      //   console.log("Fetched Transactions:", res.data);
      const fetchedData = res.data.data || [];
      setTransactions(fetchedData);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "danger";
      case "cancelled":
        return "secondary";
      default:
        return "dark";
    }
  };

  // Filter transactions by search term
  const filteredTransactions = transactions.filter((txn) => {
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
    itemsPerPage === "All" ? filteredTransactions.length : itemsPerPage;

  // Calculate indices based on itemsPerPageValue
  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;

  // Slice transactions accordingly
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Payment History"
          levelTwo="Home"
          levelThree="Transactions"
        />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                <Card className={`shadow`}>
                  <Card.Body className="main-card">
                    <Row className="mb-3 align-items-center">
                      <Col xs={12} sm={6} className="mb-2 mb-sm-0">
                        <InputGroup>
                          <InputGroup.Text>🔍</InputGroup.Text>
                          <Form.Control
                            type="text"
                            placeholder="Search transactions..."
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
                              <th className="text-center">Transaction</th>
                              <th className="text-end">Amount</th>
                              <th className="text-center">Payment Method</th>
                              <th>Payment Date</th>
                              <th className="text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentTransactions.length > 0 ? (
                              currentTransactions.map((txn, index) => (
                                <tr key={txn._id}>
                                  <td className="text-center">{index + 1}</td>
                                  <td>{txn._id.slice(-6).toUpperCase()}</td>
                                  <td
                                    className={`text-center ${
                                      txn.transaction.toLowerCase() === "credit"
                                        ? "text-success"
                                        : "text-danger"
                                    }`}
                                  >
                                    {txn.transaction.toUpperCase()}
                                  </td>
                                  <td
                                    className={`text-end ${
                                      txn.transaction.toLowerCase() === "credit"
                                        ? "text-success"
                                        : "text-danger"
                                    }`}
                                  >
                                    ₱{txn.amount?.toFixed(2)}
                                  </td>
                                  <td className="text-center">
                                    {txn.paymentMethod.toUpperCase()}
                                  </td>
                                  <td>
                                    {txn.paymentDate
                                      ? new Date(
                                          txn.paymentDate
                                        ).toLocaleString()
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
                                  colSpan="7"
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

                    {!loading && filteredTransactions.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-3 flex-column flex-sm-row gap-2">
                        <div className={`text-muted`}>
                          Showing{" "}
                          {filteredTransactions.length === 1
                            ? "1 row"
                            : `${indexOfFirstItem + 1}–${Math.min(
                                indexOfLastItem,
                                filteredTransactions.length
                              )} rows`}{" "}
                          out of{" "}
                          {filteredTransactions.length === 1
                            ? "1 entry"
                            : `${filteredTransactions.length} entries`}
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

export default PaymentHistory;
