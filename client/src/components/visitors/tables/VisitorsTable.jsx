import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { VisitorTypeEnum } from "../../../enums/enums.js";

const VisitorsTable = ({ loading, currentData, handleEdit, handleDelete }) => {
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
            <th className="text-center">Action</th>
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
                    {visitDetail.visitDate
                      ? new Date(visitDetail.visitDate).toLocaleString()
                      : "—"}
                  </td>
                  <td className="text-center">
                    {visitDetail.expiryStatus ? (
                      <span className="badge bg-primary">No Expiration</span>
                    ) : (
                      <span className="badge bg-success">Valid Today</span>
                    )}
                  </td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center">
                      <Button
                        size="sm"
                        variant="primary"
                        className="d-flex align-items-center"
                        onClick={() => handleEdit(visitDetail._id)}
                      >
                        <FaEdit />
                        <span>Edit</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        className="d-flex align-items-center ml-2"
                        onClick={() => handleDelete(visitDetail._id)}
                      >
                        <FaTrash />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )
          ) : (
            <tr>
              <td colSpan="11" className={`text-center ${"text-muted"}`}>
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
