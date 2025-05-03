import React from "react";

const ReportFilters = ({
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  reportType,
  setReportType,
  onGenerate,
  isGenerating,
}) => (
  <div className="row">
    <div className="col-md-4 form-group">
      <label>Date From</label>
      <input
        type="date"
        className="form-control"
        value={dateFrom}
        onChange={(e) => setDateFrom(e.target.value)}
      />
    </div>
    <div className="col-md-4 form-group">
      <label>Date To</label>
      <input
        type="date"
        className="form-control"
        value={dateTo}
        onChange={(e) => setDateTo(e.target.value)}
      />
    </div>
    <div className="col-md-4 form-group">
      <label>Report Type</label>
      <select
        className="form-control"
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="visitor">Visitor Report</option>
        <option value="payment">Payment Report</option>
        <option value="audit">Audit Logs</option>
      </select>
    </div>
    <div className="col-12 text-right">
      <button
        className="btn btn-primary"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Report"}
      </button>
    </div>
  </div>
);

export default ReportFilters;
