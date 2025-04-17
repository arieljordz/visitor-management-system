import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";

const TableAdminGeneratedCodes = ({
  loading,
  currentData,
  darkMode,
  handleViewQRCode,
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
            <th>Client Name</th>
            <th className="text-center">QR Code</th>
            <th>Generated Date</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((txn, index) => (
              <tr key={txn._id}>
                <td className="text-center">{index + 1}</td>
                <td>{txn._id.slice(-6).toUpperCase()}</td>
                <td>{txn.userId.name}</td>
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
                  <span className={`badge bg-${getBadgeClass(txn.status)}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="6"
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

export default TableAdminGeneratedCodes;
