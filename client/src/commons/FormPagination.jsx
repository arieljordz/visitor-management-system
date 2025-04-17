import React from "react";
import { Pagination } from "react-bootstrap";

const FormPagination = ({
  loading,
  filteredData,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  paginate,
  darkMode,
}) => {
  if (loading || filteredData.length === 0) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-column flex-sm-row gap-2">
      <div className={`${darkMode ? "text-light" : "text-muted"}`}>
        Showing{" "}
        {filteredData.length === 1
          ? "1 row"
          : `${indexOfFirstItem + 1}–${Math.min(
              indexOfLastItem,
              filteredData.length
            )} rows`}{" "}
        out of{" "}
        {filteredData.length === 1
          ? "1 entry"
          : `${filteredData.length} entries`}
      </div>

      {totalPages > 1 && (
        <Pagination className="mb-0">
          <Pagination.Prev
            onClick={() => currentPage > 1 && paginate(currentPage - 1)}
            disabled={currentPage === 1}
          />
          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === currentPage}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next
            onClick={() =>
              currentPage < totalPages && paginate(currentPage + 1)
            }
            disabled={currentPage === totalPages}
          />
        </Pagination>
      )}
    </div>
  );
};

export default FormPagination;
