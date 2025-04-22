import React, { useEffect, useState } from "react";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import { Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import PaymentHistoryTable from "../../components/transactions/tables/PaymentHistoryTable";

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
      // console.log("Fetched Transactions:", res);
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
  const filteredData = transactions.filter((txn) => {
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

  // Slice transactions accordingly
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Total pages only if not showing All
  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

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
                    {/* Search and Items per page */}
                    <Search
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                    />

                    {/* Table */}
                    <PaymentHistoryTable
                      loading={loading}
                      currentData={currentData}
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
