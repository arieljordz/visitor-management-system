import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const TableVerification = ({
  loading,
  currentData,
  darkMode,
  handleViewProofImage,
  handleVerification,
  getBadgeClass,
}) => {
  return loading ? (
    <div className="text-center my-4">
      <Spinner animation="border" />
    </div>
  ) : (
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
            <th className="text-center">#</th>
            <th>TransactionID</th>
            <th className="text-center">Transaction</th>
            <th className="text-center">Proof</th>
            <th className="text-end">Amount</th>
            <th className="text-center">Payment Method</th>
            <th>Payment Date</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((txn, index) => (
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
                <td>
                  {txn.paymentDate
                    ? new Date(txn.paymentDate).toLocaleString()
                    : "—"}
                </td>
                <td className="text-center">
                  <span
                    className={`badge bg-${getBadgeClass(
                      txn.verificationStatus
                    )}`}
                  >
                    {txn.verificationStatus}
                  </span>
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      className="d-flex align-items-center gap-1"
                      onClick={() => handleVerification(txn._id, "verified")}
                    >
                      <FaCheckCircle />
                      <span>Verify</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="d-flex align-items-center gap-1"
                      onClick={() => handleVerification(txn._id, "declined")}
                    >
                      <FaTimesCircle />
                      <span>Decline</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
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
  );
};

export default TableVerification;
