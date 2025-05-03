import React from "react";

// Function to calculate the total of the 'amount' column
const calculateTotalAmount = (rows) => {
  return rows.reduce((sum, row) => {
    const amountValue = row.amount?.toString().replace(/[^0-9.-]+/g, "") || "0";
    const num = parseFloat(amountValue);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
};

// Function to render the table header
const renderHeader = (columns) => {
  return (
    <tr>
      {columns.map((col, index) => (
        <th key={index} style={{ width: col.width || "auto" }}>
          {col.header.toUpperCase()}
        </th>
      ))}
    </tr>
  );
};

// Function to render the table rows
const renderRows = (rows, columns) => {
  return rows.map((row) => (
    <tr key={row.id}>
      {columns.map((col, index) => (
        <td key={index}>{row[col.key]}</td>
      ))}
    </tr>
  ));
};

// Function to render the footer with the total amount if applicable
const renderFooter = (columns, totalAmount) => {
  return (
    <tfoot>
      <tr>
        {columns.map((col, index) => (
          <td key={index}>
            {col.key === "amount" ? `PHP ${totalAmount.toFixed(2)}` : index === 0 ? "Total" : ""}
          </td>
        ))}
      </tr>
    </tfoot>
  );
};

const ReportTable = ({ rows, columns }) => {
  // Check if there's an 'amount' column
  const hasAmountColumn = columns.some((col) => col.key === "amount");

  // If there's an 'amount' column, calculate the total
  const totalAmount = hasAmountColumn ? calculateTotalAmount(rows) : 0;

  // Check if the total should be displayed (only show if there's a valid amount)
  const showTotal = totalAmount > 0;

  return (
    <table className="table table-striped">
      <thead>{renderHeader(columns)}</thead>
      <tbody>{renderRows(rows, columns)}</tbody>
      {hasAmountColumn && showTotal && renderFooter(columns, totalAmount)}
    </table>
  );
};

export default ReportTable;
