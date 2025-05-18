import React from "react";
import { Pagination } from "react-bootstrap";

const Paginations = ({
  loading,
  filteredData,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  paginate,
}) => {
  // console.log("filteredData:", filteredData);
  if (loading || filteredData.length === 0) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-column flex-sm-row gap-2">
      {/* <div className={`text-muted`}>
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
      </div> */}

      <div className="text-muted">
        {(() => {
          const totalVisitDetails = filteredData.reduce((sum, item) => {
            return (
              sum +
              (Array.isArray(item.visitDetails) ? item.visitDetails.length : 0)
            );
          }, 0);

          const useVisitDetails = totalVisitDetails > 0;
          const totalEntries = useVisitDetails
            ? totalVisitDetails
            : filteredData.length;

          const start = totalEntries === 1 ? 1 : indexOfFirstItem + 1;
          const end = Math.min(indexOfLastItem, totalEntries);

          return (
            <>
              Showing {totalEntries === 1 ? "1 row" : `${start}–${end} rows`}{" "}
              out of{" "}
              {totalEntries === 1 ? "1 entry" : `${totalEntries} entries`}
            </>
          );
        })()}
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

export default Paginations;
