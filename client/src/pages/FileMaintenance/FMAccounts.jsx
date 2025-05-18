import React, { useEffect, useState } from "react";
import { Button, Spinner, Row, Col, Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { useAuth } from "../../context/AuthContext";
import Navpath from "../../components/common/Navpath";
import Search from "../../components/common/Search";
import Paginations from "../../components/common/Paginations";
import AccountsTable from "../../components/fileMaintenance/tables/AccountsTable";
import AccountsModal from "../../components/fileMaintenance/modals/AccountsModal";
import {
  getUsersByRole,
  getUsersStaff,
  getUserById,
  deleteUser,
} from "../../services/userService.js";
import { StatusEnum, UserRoleEnum } from "../../enums/enums.js";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function FMAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchAccounts();
    }
  }, [user]);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      let data;

      if (user.role === UserRoleEnum.ADMIN) {
        data = await getUsersByRole(
          UserRoleEnum.ADMIN,
          UserRoleEnum.SUBSCRIBER,
          UserRoleEnum.STAFF
        );
      } else {
        data = await getUsersStaff(user.userId);
      }

      setAccounts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const data = await getUserById(id);
      setSelectedRow(data);
      setShowModal(true);
    } catch (err) {
      toast.error("Failed to fetch Account.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Account will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      reverseButtons: false,
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(id);
        toast.success("Account deleted.");
        fetchAccounts();
      } catch (err) {
        toast.error("Failed to delete Account.");
      }
    }
  };

  const handleOpen = () => {
    setSelectedRow(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setSelectedRow(null);
    setShowModal(false);
  };

  const getBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case StatusEnum.ACTIVE:
        return "success";
      case StatusEnum.INACTIVE:
        return "warning";
      default:
        return "dark";
    }
  };

  const filteredData = accounts.filter((obj) => {
    const values = [
      obj._id?.slice(-6),
      obj.email,
      obj.name,
      obj.role,
      obj.address,
      obj.status,
      obj.department,
      obj.categoryType,
      obj.subscription,
      new Date(obj.createdAt).toLocaleString(),
    ];

    return values.some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const itemsPerPageValue =
    itemsPerPage === "All" ? filteredData.length : itemsPerPage;

  const indexOfLastItem = currentPage * itemsPerPageValue;
  const indexOfFirstItem = indexOfLastItem - itemsPerPageValue;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages =
    itemsPerPage === "All" ? 1 : Math.ceil(filteredData.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <AccessControlWrapper>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath
          levelOne="Accounts"
          levelTwo="Home"
          levelThree="File Maintenance"
        />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <div className="mb-4 text-start">
                      <Button
                        variant="success"
                        onClick={() => setShowModal(true)}
                      >
                        <FaPlus className="mr-1" />
                        Add User
                      </Button>
                    </div>

                    <Search
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      itemsPerPage={itemsPerPage}
                      setItemsPerPage={setItemsPerPage}
                      setCurrentPage={setCurrentPage}
                      onAdd={handleOpen}
                    />

                    <AccountsTable
                      loading={loading}
                      currentData={currentData}
                      handleEdit={handleEdit}
                      handleDelete={handleDelete}
                      getBadgeClass={getBadgeClass}
                    />

                    <Paginations
                      loading={loading}
                      filteredData={filteredData}
                      currentPage={currentPage}
                      totalPages={totalPages}
                      indexOfFirstItem={indexOfFirstItem}
                      indexOfLastItem={indexOfLastItem}
                      paginate={paginate}
                    />

                    <AccountsModal
                      show={showModal}
                      onHide={handleClose}
                      selectedRow={selectedRow}
                      refreshList={fetchAccounts}
                      userId={user?.userId}
                    />
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </AccessControlWrapper>
  );
}

export default FMAccounts;
