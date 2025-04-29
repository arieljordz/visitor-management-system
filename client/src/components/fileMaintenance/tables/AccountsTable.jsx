import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";

const AccountsTable = ({
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
            <th className="text-center">Email</th>
            <th className="text-center">Full Name</th>
            <th className="text-center">Address</th>
            <th className="text-center">Role</th>
            <th className="text-center">Date Created</th>
            <th className="text-center">Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((user, index) => (
              <tr key={user._id}>
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{user.email}</td>
                <td className="text-center">{user.name ? user.name : "N/A"}</td>
                <td className="text-center">{user.address}</td>
                <td className="text-center">{user.role}</td>
                <td className="text-center">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : "—"}
                </td>
                <td className="text-center">
                  <span className={`badge bg-${getBadgeClass(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="text-center">
                  <div className="d-flex justify-content-center">
                    <Button
                      size="sm"
                      variant="primary"
                      className="d-flex align-items-center"
                      onClick={() => handleEdit(user._id)}
                    >
                      <FaEdit />
                      <span>Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="d-flex align-items-center ml-2"
                      onClick={() => handleDelete(user._id)}
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

export default AccountsTable;
