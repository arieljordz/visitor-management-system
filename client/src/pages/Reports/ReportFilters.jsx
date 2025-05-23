import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDepartmentsByUserId } from "../../services/departmentService";
import { UserRoleEnum } from "../../enums/enums.js";

const ReportFilters = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  reportType,
  setReportType,
  department,
  setDepartment,
  onGenerate,
  loading,
}) => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const subscriberId =
    user.role === UserRoleEnum.SUBSCRIBER ? user.userId : user.subscriberId;

  const reportOptionsByRole = {
    [UserRoleEnum.ADMIN]: ["payment", "audit"],
    [UserRoleEnum.SUBSCRIBER]: ["visitor"],
    [UserRoleEnum.STAFF]: ["visitor"],
  };

  const reportLabels = {
    visitor: "Visitor Report",
    payment: "Payment Report",
    audit: "Audit Logs",
  };

  useEffect(() => {
    if (reportType === "visitor") fetchDepartments();
  }, [reportType]);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartmentsByUserId(subscriberId);
      setDepartments(data || []);
      console.log("departments:", data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  return (
    <form onSubmit={onGenerate}>
      <div className="row align-items-end g-3">
        {/* Report Type */}
        <div className="col-md-2">
          <label className="form-label">Report Type</label>
          <select
            className="form-control"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {(reportOptionsByRole[user?.role] || []).map((type) => (
              <option key={type} value={type}>
                {reportLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Date Fields */}
        {reportType && (
          <>
            <div className="col-md-2">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Date To</label>
              <input
                type="date"
                className="form-control"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {/* Department Filter (only for Visitor Report) */}
        {reportType === "visitor" && user.role !== UserRoleEnum.ADMIN && (
          <div className="col-md-2">
            <label className="form-label">Department</label>
            <select
              className="form-control"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept.description}>
                  {dept.description}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Generate Button */}
        <div className="col-md-2 d-flex justify-content-end">
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading || !reportType}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReportFilters;
