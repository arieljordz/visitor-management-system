import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ReportActions = ({ reportData, columns }) => {
  // Function to calculate the total of the 'amount' column
  const calculateTotalAmount = () => {
    const amountColumn = columns.find((col) => col.key === "amount");
    if (!amountColumn) return null; // If there's no amount column, return null

    const totalAmount = reportData.rows.reduce((sum, row) => {
      const val = parseFloat(
        row[amountColumn.key]?.toString().replace(/[^0-9.-]+/g, "")
      );
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    return totalAmount > 0 ? `PHP ${totalAmount.toFixed(2)}` : null; // Return null if total is 0
  };

  // Function to get the total row for Excel and PDF exports
  const getTotalRow = () => {
    const totalAmount = calculateTotalAmount();
    if (!totalAmount) return null; // If no total amount, do not show "Total" row

    return columns.map((col, index) => {
      if (col.key === "amount") {
        return totalAmount;
      }
      // Show "Total" in the first column, blank in others
      return index === 0 ? "Total" : "";
    });
  };

  const exportToExcel = () => {
    const headers = columns.map((col) => col.header);
    const dataRows = reportData.rows.map((row) =>
      columns.map((col) => row[col.key])
    );

    const totalRow = getTotalRow();
    if (totalRow) dataRows.push(totalRow); // Append total row if it exists

    const sheetData = [headers, ...dataRows];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${reportData.title.toLowerCase().replace(" ", "-")}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(reportData.title, 14, 16);

    const bodyRows = reportData.rows.map((row) =>
      columns.map((col) => row[col.key])
    );

    const totalRow = getTotalRow();
    if (totalRow) bodyRows.push(totalRow); // Append total row if it exists

    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: bodyRows,
      startY: 20,
    });

    doc.save(`${reportData.title.toLowerCase().replace(" ", "-")}.pdf`);
  };

  return (
    <div className="d-flex justify-content-end">
      <button className="btn btn-success btn-sm me-2" onClick={exportToExcel}>
        <i className="fas fa-file-excel me-1"></i> Export to Excel
      </button>
      <button className="btn btn-danger btn-sm ml-2" onClick={exportToPDF}>
        <i className="fas fa-file-pdf me-1"></i> Export to PDF
      </button>
    </div>
  );
};

export default ReportActions;
