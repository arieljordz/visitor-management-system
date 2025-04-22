import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";

const AdminPaymentHistoryTable = ({ loading, currentData, getBadgeClass }) => {
  return loading ? (
    <div className="text-center my-4">
      <Spinner animation="border" />
    </div>
  ) : (
    <div className="table-responsive">
      <Table striped bordered hover className="mb-0">
        <thead>
          <tr>
            <th className="text-center">#</th>
            <th className="text-center">TransactionID</th>
            <th className="text-center">Client Name</th>
            <th className="text-center">Transaction</th>
            <th className="text-right">Amount</th>
            <th className="text-center">Payment Method</th>
            <th className="text-center">Payment Date</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((txn, index) => (
              <tr key={txn._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{txn._id.slice(-6).toUpperCase()}</td>
                <td className="text-center">{txn.userId.name}</td>
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
                  className={`text-right ${
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
              <td colSpan="8" className={`text-center text-muted`}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminPaymentHistoryTable;
