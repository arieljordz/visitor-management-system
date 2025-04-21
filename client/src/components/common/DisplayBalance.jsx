import React from "react";

const DisplayBalance = ({ balance, isFetching, error }) => {
  if (error) {
    return <span className="text-danger">{error}</span>;
  }

  return (
    <span
      className="fw-bold me-3 d-flex align-items-center gap-2"
      style={{ transition: "opacity 0.3s ease" }}
    >
      💰 Current Balance:
      <span className="text-success ml-2"> ₱{balance.toFixed(2)}</span>
      {isFetching && (
        <div
          className="spinner-border spinner-border-sm text-secondary"
          role="status"
        >
          <span className="visually-hidden">Refreshing...</span>
        </div>
      )}
    </span>
  );
};

export default DisplayBalance;
