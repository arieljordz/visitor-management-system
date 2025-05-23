import React, { useState, useEffect } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { generateReportData } from "../../utils/reportUtils";
import ReportFilters from "./ReportFilters";
import ReportActions from "./ReportActions";
import ReportTable from "./ReportTable";
import Navpath from "../../components/common/Navpath";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";
import { UserRoleEnum } from "../../enums/enums.js";

function GenerateReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [reportType, setReportType] = useState(user.role === UserRoleEnum.ADMIN ? "payment" : "visitor");
  const [reportData, setReportData] = useState(null);
  const [department, setDepartment] = useState("");

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    setReportData(null);
  }, [reportType]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!dateFrom || !dateTo)
      return toast.warning("Please select a date range.");

    try {
      setLoading(true);
      const {
        title,
        rows,
        columns: cols,
      } = await generateReportData(reportType, dateFrom, dateTo, department);
      setReportData({ title, rows });
      setColumns(cols);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccessControlWrapper>
      <div className="content-wrapper">
        <Navpath levelOne="Reports" levelTwo="Home" levelThree="Reports" />
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                <Card>
                  <Card.Body className="main-card">
                    <div className="card card-primary card-outline">
                      <div className="card-body">
                        <ReportFilters
                          dateFrom={dateFrom}
                          setDateFrom={setDateFrom}
                          dateTo={dateTo}
                          setDateTo={setDateTo}
                          reportType={reportType}
                          setReportType={setReportType}
                          department={department}
                          setDepartment={setDepartment}
                          onGenerate={handleGenerate}
                          loading={loading}
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
                              No data found.
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

export default GenerateReports;
