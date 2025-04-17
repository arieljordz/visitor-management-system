import React, { useState, useEffect } from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const TableProofs = ({
  loading,
  currentData,
  darkMode,
  handleViewProofImage,
  getBadgeClass,
  refreshList,
}) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const isAllSelected =
    currentData.length > 0 && selectedRows.length === currentData.length;

  // Toggle single row selection
  const handleCheckboxChange = (id) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((rowId) => rowId !== id)
        : [...prevSelected, id]
    );
  };

  // Select or deselect all
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      const allIds = currentData.map((txn) => txn._id);
      setSelectedRows(allIds);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `You are about to delete ${selectedRows.length} record(s).`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.delete(`${API_URL}/api/delete-payment-proofs`, {
          data: { selectedRows },
        });
        toast.success(`${selectedRows.length} record(s) have been deleted.`);
        refreshList();
        setSelectedRows([]);
      } catch (error) {
        toast.error("There was an error deleting the records.");
        console.error("Delete error:", error);
      }
    }
  };

  // Clear selected rows if currentData changes
  useEffect(() => {
    setSelectedRows([]);
  }, [currentData]);

  return loading ? (
    <div className="text-center my-4">
      <Spinner animation="border" />
    </div>
  ) : (
    <>
      {selectedRows.length > 0 && (
        <div className="mb-3 text-end">
          <Button variant="danger" size="sm" onClick={handleDeleteSelected}>
            Delete Selected ({selectedRows.length})
          </Button>
        </div>
      )}

      <div className="table-responsive">
        <Table
          striped
          bordered
          hover
          variant={darkMode ? "dark" : "light"}
          className="mb-0"
        >
          <thead>
            <tr>
              <th className="text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="text-center">TransactionID</th>
              <th className="text-center">Transaction</th>
              <th className="text-center">Proof</th>
              <th className="text-end">Amount</th>
              <th className="text-center">Payment Method</th>
              <th className="text-center">Payment Date</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((txn) => (
                <tr key={txn._id}>
                  <td className="text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(txn._id)}
                      onChange={() => handleCheckboxChange(txn._id)}
                    />
                  </td>
                  <td className="text-center">
                    {txn._id.slice(-6).toUpperCase()}
                  </td>
                  <td
                    className={`text-center ${
                      txn.transaction.toLowerCase() === "credit"
                        ? "text-success"
                        : "text-danger"
                    }`}
                  >
                    {txn.transaction.toUpperCase()}
                  </td>
                  <td className="text-center">
                    {txn.proofOfPayment ? (
                      <span
                        className="text-primary cursor-pointer"
                        onClick={() =>
                          handleViewProofImage(
                            txn.proofOfPayment,
                            txn._id.slice(-6).toUpperCase()
                          )
                        }
                      >
                        View Proof of Payment
                      </span>
                    ) : (
                      "No Proof Image"
                    )}
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
                  <td className="text-center">
                    {txn.paymentDate
                      ? new Date(txn.paymentDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-center">
                    <span className={`badge bg-${getBadgeClass(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className={`text-center ${
                    darkMode ? "text-light" : "text-muted"
                  }`}
                >
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default TableProofs;
