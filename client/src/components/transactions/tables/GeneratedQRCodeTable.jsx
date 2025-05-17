import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { formatDate } from "../../../utils/globalUtils";

const GeneratedQRCodeTable = ({
  loading,
  currentData,
  handleViewQRCode,
  getBadgeClass,
}) => {
  // console.log("currentData:", currentData);
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
            <th className="text-center">Visitor Type</th>
            <th className="text-center">Client Name</th>
            <th className="text-center">Name/Group</th>
            <th className="text-center">No. of Visitors</th>
            <th className="text-center">Purpose</th>
            <th className="text-center">QR Code</th>
            <th className="text-center">Generated Date</th>
            <th className="text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((txn, index) => (
              <tr key={txn._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">
                  {txn._id.slice(-6).toUpperCase()}
                </td>
                <td className="text-center">
                  {txn.visitorId?.visitorType.toUpperCase()}
                </td>
                <td className="text-center">{txn.userId.name.toUpperCase()}</td>
                <td className="text-center">
                  {txn.visitorId?.visitorType === "Individual"
                    ? `${txn.visitorId?.firstName.toUpperCase() || ""} ${
                        txn.visitorId?.lastName.toUpperCase() || ""
                      }`
                    : txn.visitorId?.groupName.toUpperCase()}
                </td>
                <td className="text-center">
                  {txn.visitdetailsId?.noOfVisitors
                    ? txn.visitdetailsId?.noOfVisitors
                    : 1}
                </td>
                <td className="text-center">
                  {txn.visitdetailsId?.purpose.toUpperCase()}
                </td>
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
                <td className="text-center">{formatDate(txn.createdAt)}</td>
                <td className="text-center">
                  <span className={`badge bg-${getBadgeClass(txn.status)}`}>
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="10" className={`text-center text-muted`}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default GeneratedQRCodeTable;
