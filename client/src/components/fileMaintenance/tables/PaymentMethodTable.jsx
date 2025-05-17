import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { formatDate } from "../../../utils/globalUtils";

const PaymentMethodTable = ({
  loading,
  currentData,
  handleEdit,
  handleDelete,
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
            <th className="text-center">ID</th>
            <th className="text-center">Payment Method</th>
            <th className="text-center">Date Created</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <tr key={row._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">
                  {row._id.slice(-6).toUpperCase()}
                </td>
                <td className="text-center">{row.description}</td>
                <td className="text-center">{formatDate(row.createdAt)}</td>
                <td className="text-center">
                  <span className={`badge bg-${getBadgeClass(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center">
                    <Button
                      size="sm"
                      variant="primary"
                      className="d-flex align-items-center"
                      onClick={() => handleEdit(row._id)}
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="d-flex align-items-center ml-2"
                      onClick={() => handleDelete(row._id)}
                    >
                      <FaTrash />
                      <span>Delete</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className={`text-center text-muted`}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PaymentMethodTable;
