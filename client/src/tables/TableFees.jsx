import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const TableFees = ({
  loading,
  currentData,
  darkMode,
  handleEdit,
  handleDelete,
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
            <th className="text-center">FeeID</th>
            <th className="text-center">Amount Fee</th>
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
                <td className="text-center">
                  ₱{Number(row.fee || 0).toFixed(2)}
                </td>
                <td className="text-center">
                  {row.createdAt
                    ? new Date(row.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td className="text-center">
                  <span
                    className={`badge ${
                      row.active ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {row.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="text-center">
                  <div className="d-flex justify-content-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      className="d-flex align-items-center gap-1"
                      onClick={() => handleEdit(row._id)}
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="d-flex align-items-center gap-1"
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

export default TableFees;
