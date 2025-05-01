import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";

const VisitorsTable = ({
  loading,
  currentData,
  onGenerateQRClick,
  handleViewQRCode,
  getBadgeClass,
}) => {
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
            <th className="text-center">Visitor ID</th>
            <th className="text-center">Type</th>
            <th className="text-center">Visitor Name</th>
            <th className="text-center">Group Name</th>
            <th className="text-center">No. of Visitors</th>
            <th className="text-center">Purpose</th>
            <th className="text-center">Classification</th>
            <th className="text-center">Visit Date</th>
            <th className="text-center">Date Created</th>
            <th className="text-center">QR Code</th>
            <th className="text-center">Generate QR</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((visitor, index) => (
              <tr key={visitor._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">
                  {visitor._id.slice(-6).toUpperCase()}
                </td>
                <td className="text-center">{visitor.visitorType}</td>
                <td className="text-center">
                  {visitor.firstName} {visitor.lastName}
                </td>
                <td className="text-center">{visitor.groupName || "—"}</td>
                <td className="text-center">{visitor.noOfVisitors || "—"}</td>
                <td className="text-center">{visitor.visitDetail.purpose}</td>
                <td className="text-center">{visitor.visitDetail.classification}</td>
                <td className="text-center">
                  {visitor.visitDetail.visitDate
                    ? new Date(visitor.visitDate).toLocaleString()
                    : "—"}
                </td>
                <td className="text-center">
                  {new Date(visitor.createdAt).toLocaleString()}
                </td>
                <td className="text-center">
                  {visitor.activeQRCode?.qrImageUrl ? (
                    <span
                      className="text-primary cursor-pointer"
                      onClick={() =>
                        handleViewQRCode(
                          visitor.activeQRCode?.qrImageUrl,
                          visitor.activeQRCode?._id.slice(-6).toUpperCase()
                        )
                      }
                    >
                      View QR Code
                    </span>
                  ) : (
                    "Generate QR Code"
                  )}
                </td>
                <td className="text-center">
                  <Button
                    size="sm"
                    variant="success"
                    className="me-2"
                    onClick={() => onGenerateQRClick(visitor._id)}
                  >
                    Generate
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="12" className={`text-center ${"text-muted"}`}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default VisitorsTable;
