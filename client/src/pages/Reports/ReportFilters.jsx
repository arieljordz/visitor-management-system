import React from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRoleEnum } from "../../enums/enums.js";

const ReportFilters = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  reportType,
  setReportType,
  onGenerate,
  loading,
}) => {
  const { user } = useAuth();

  const reportOptionsByRole = {
    [UserRoleEnum.ADMIN]: ["visitor", "payment", "audit"],
    [UserRoleEnum.SUBSCRIBER]: ["visitor", "payment"],
    [UserRoleEnum.STAFF]: ["visitor"],
  };

  const reportLabels = {
    visitor: "Visitor Report",
    payment: "Payment Report",
    audit: "Audit Logs",
  };

  return (
    <form onSubmit={onGenerate}>
      <div className="row align-items-end g-3">
        {/* Report Type */}
        <div className="col-md-4">
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

        {/* Show Date Fields only if reportType is selected */}
        {reportType && (
          <>
            <div className="col-md-3">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-control"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
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
