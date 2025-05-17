import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { VisitorTypeEnum, QRStatusEnum } from "../../../enums/enums.js";
import { formatDate } from "../../../utils/globalUtils";

const DashboardTable = ({
  loading,
  currentData,
  onGenerateQRClick,
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
            <th className="text-center">Visitor ID</th>
            <th className="text-center">Type</th>
            <th className="text-center">Name/Group</th>
            <th className="text-center">No. of Visitors</th>
            <th className="text-center">Purpose</th>
            <th className="text-center">Department</th>
            <th className="text-center">Classification</th>
            <th className="text-center">Visit Date</th>
            <th className="text-center">Expiry Status</th>
            <th className="text-center">QR Status</th>
            <th className="text-center">QR Code</th>
            <th className="text-center">Generate QR</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((visitor, index) =>
              visitor.visitDetails?.map((visitDetail, visitIndex) => (
                <tr key={visitDetail._id}>
                  <td className="text-center">{visitIndex + 1}</td>
                  <td className="text-center">
                    {visitor._id.slice(-6).toUpperCase()}
                  </td>
                  <td className="text-center">
                    {visitor.visitorType?.toUpperCase()}
                  </td>
                  <td className="text-center">
                    {visitor.visitorType === VisitorTypeEnum.GROUP
                      ? visitor.groupName?.toUpperCase()
                      : `${visitor.firstName?.toUpperCase()} ${visitor.lastName?.toUpperCase()}`}
                  </td>
                  <td className="text-center">
                    {visitDetail.noOfVisitors || "1"}
                  </td>
                  <td className="text-center">
                    {visitDetail.purpose?.toUpperCase()}
                  </td>
                  <td className="text-center">
                    {visitDetail.department?.toUpperCase()}
                  </td>
                  <td className="text-center">
                    {visitDetail.classification?.toUpperCase()}
                  </td>
                  <td className="text-center">
                    {formatDate(visitDetail.visitDate)}
                  </td>
                  <td className="text-center">
                    {visitDetail.expiryStatus ? (
                      <span className="badge bg-primary">No Expiration</span>
                    ) : (
                      <span className="badge bg-success">Valid Today</span>
                    )}
                  </td>
                  <td className="text-center">
                    <span
                      className={`badge bg-${getBadgeClass(
                        visitDetail.activeQRCode
                          ? visitDetail.activeQRCode.status
                          : QRStatusEnum.PENDING
                      )}`}
                    >
                      {visitDetail.activeQRCode
                        ? visitDetail.activeQRCode.status
                        : QRStatusEnum.PENDING}
                    </span>
                  </td>
                  <td className="text-center">
                    {visitDetail.activeQRCode?.qrImageUrl ? (
                      <span
                        className="text-primary cursor-pointer"
                        onClick={() =>
                          handleViewQRCode(
                            visitDetail.activeQRCode?.qrImageUrl,
                            visitDetail.activeQRCode?._id
                              .slice(-6)
                              .toUpperCase()
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
                      onClick={() =>
                        onGenerateQRClick(visitor._id, visitDetail._id)
                      }
                    >
                      Generate
                    </Button>
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="13" className={`text-center ${"text-muted"}`}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default DashboardTable;
