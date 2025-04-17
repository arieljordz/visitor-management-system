import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import FormSearch from "../../commons/FormSearch";
import FormPagination from "../../commons/FormPagination";
import TableAdminPaymentDetails from "../../tables/TableAdminPaymentDetails";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const AdminPaymentDetails = ({ user, darkMode }) => {
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
      const res = await axios.get(`${API_URL}/api/get-payment-details`);
      console.log("Fetched Transactions:", res.data);
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
    <>
      {/* Search and Items per page */}
      <FormSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        itemsPerPage={itemsPerPage}
        setItemsPerPage={setItemsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Table */}
      <TableAdminPaymentDetails
        loading={loading}
        currentData={currentData}
        darkMode={darkMode}
        getBadgeClass={getBadgeClass}
      />

      {/* Pagination + Count */}
      <FormPagination
        loading={loading}
        filteredData={filteredData}
        currentPage={currentPage}
        totalPages={totalPages}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        paginate={paginate}
        darkMode={darkMode}
      />
    </>
  );
};

export default AdminPaymentDetails;
