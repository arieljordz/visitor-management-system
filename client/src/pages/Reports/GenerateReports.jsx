import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  getVisitorsByDateRange,
  getPaymentDetailsByDateRange,
  getAuditLogsByDateRange,
} from "../../services/reportService";
import { formatDate } from "../../utils/globalUtils";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";
import ReportTable from "./ReportTable";
import Navpath from "../../components/common/Navpath";

function GenerateReports({ user, setUser }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState("visitor");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [columns, setColumns] = useState([]);

  // Reset reportData when reportType changes
  useEffect(() => {
    setReportData(null);
  }, [reportType]);

  const handleGenerate = async () => {
    if (!dateFrom || !dateTo)
      return toast.warning("Please select a date range.");
    setIsGenerating(true);

    try {
      let rows = [];
      let title = "";

      switch (reportType) {
        case "visitor":
          const visitors = await getVisitorsByDateRange({ dateFrom, dateTo });
          console.log("visitors:", visitors);
          setColumns([
            { header: "#", key: "id", width: "10%" },
            { header: "Name", key: "name" },
            { header: "Visitor Type", key: "visitorType" },
            { header: "Purpose", key: "purpose" },
            { header: "Classification", key: "classification" },
            { header: "No. of Visitors", key: "noOfVisitors" },
            { header: "Date", key: "date" },
          ]);
          rows = visitors.map((item, index) => ({
            id: index + 1,
            name:
              item.visitorId?.visitorType === "Individual"
                ? `${item.visitorId?.firstName?.toUpperCase()} ${item.visitorId?.lastName?.toUpperCase()}`
                : item.visitorId?.groupName?.toUpperCase(),
            visitorType: item.visitorId?.visitorType?.toUpperCase(),
            purpose: item.purpose.toUpperCase(),
            classification: item.classification?.toUpperCase(),
            noOfVisitors: item.noOfVisitors ? item.noOfVisitors : 1,
            date: formatDate(item.visitDate),
          }));
          title = `Visitor Report - ${formatDate(
            new Date(dateFrom)
          )} to ${formatDate(new Date(dateTo))}`;
          break;

        case "payment":
          const payments = await getPaymentDetailsByDateRange({
            dateFrom,
            dateTo,
          });
          console.log("payments:", payments);
          setColumns([
            { header: "#", key: "id" },
            { header: "User", key: "user" },
            { header: "Amount", key: "amount" },
            { header: "Method", key: "method" },
            { header: "Status", key: "status" },
            { header: "Date", key: "date" },
          ]);
          rows = payments.map((item, index) => ({
            id: index + 1,
            user: item.userId?.name.toUpperCase(),
            amount: `PHP ${parseFloat(item.amount).toFixed(2)}`,
            method: item.paymentMethod.toUpperCase(),
            status: item.status.toUpperCase(),
            date: formatDate(item.paymentDate),
          }));
          title = `Payment Report - ${formatDate(
            new Date(dateFrom)
          )} to ${formatDate(new Date(dateTo))}`;
          break;

        case "audit":
          const audits = await getAuditLogsByDateRange({ dateFrom, dateTo });
          console.log("audits:", audits);
          setColumns([
            { header: "#", key: "id" },
            { header: "User", key: "user" },
            { header: "Email", key: "email" },
            { header: "Action", key: "action" },
            { header: "IP Address", key: "ipAddress" },
            { header: "Date", key: "date" },
          ]);
          rows = audits.map((item, index) => ({
            id: index + 1,
            user: item.userId === null ? item.details?.body?.name.toUpperCase() : item.userId?.name.toUpperCase(),
            email: item.userId === null ? item.details?.body?.email : item.userId?.email,
            action: item.action.toUpperCase(),
            ipAddress: item.ipAddress.toUpperCase(),
            date: formatDate(item.createdAt),
          }));
          title = `Audit Log Report - ${formatDate(
            new Date(dateFrom)
          )} to ${formatDate(new Date(dateTo))}`;
          break;
      }
      setReportData({ title, rows });
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="content-wrapper">
      <Navpath
        levelOne="Generate Reports"
        levelTwo="Home"
        levelThree="Reports"
      />

      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <section className="content">
                    <div className="container-fluid">
                      <div className="card card-primary card-outline">
                        <div className="card-body">
                          <ReportFilters
                            dateFrom={dateFrom}
                            setDateFrom={setDateFrom}
                            dateTo={dateTo}
                            setDateTo={setDateTo}
                            reportType={reportType}
                            setReportType={setReportType}
                            onGenerate={handleGenerate}
                            isGenerating={isGenerating}
                          />
                        </div>
                      </div>

                      {reportData && (
                        <div className="card mt-3">
                          <div className="card-header align-items-center">
                            <h3 className="card-title pt-1">
                              {reportData.title}
                            </h3>
                            <ReportActions
                              reportData={reportData}
                              columns={columns}
                            />
                          </div>
                          <div className="card-body p-0">
                            {reportData.rows.length === 0 ? (
                              <div className="alert alert-warning text-center m-3">
                                No data found for selected range.
                              </div>
                            ) : (
                              <ReportTable
                                rows={reportData.rows}
                                columns={columns}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
}

export default GenerateReports;
