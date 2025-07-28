import React from "react";
import { Pagination, Form, Row, Col } from "react-bootstrap";
import "./PaginationComponent.css";

/**
 * PaginationComponent - A reusable pagination component with configurable items per page
 *
 * @param {number} currentPage - Current active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total number of items
 * @param {number} itemsPerPage - Number of items per page
 * @param {function} onPageChange - Callback when page changes (page)
 * @param {function} onItemsPerPageChange - Callback when items per page changes (itemsPerPage)
 * @param {array} itemsPerPageOptions - Available options for items per page
 * @param {boolean} showItemsPerPage - Whether to show items per page selector
 * @param {boolean} showInfo - Whether to show pagination info text
 * @param {string} className - Additional CSS classes
 * @param {number} maxVisiblePages - Maximum number of page buttons to show
 */
const PaginationComponent = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [5, 10, 25, 50],
  showItemsPerPage = true,
  showInfo = true,
  className = "",
  maxVisiblePages = 5,
  ...props
}) => {
  // Calculate visible page range
  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handlePageChange = (page) => {
    if (
      page >= 1 &&
      page <= totalPages &&
      page !== currentPage &&
      onPageChange
    ) {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value, 10);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newItemsPerPage);
    }
  };

  const handleKeyDown = (event, page) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePageChange(page);
    }
  };

  // Calculate display info
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const visiblePages = getVisiblePages();

  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div className={`pagination-component ${className}`} {...props}>
      <Row className="align-items-center">
        {/* Items per page selector */}
        {showItemsPerPage && (
          <Col xs={12} md="auto" className="mb-2 mb-md-0">
            <div className="items-per-page-selector">
              <Form.Label htmlFor="items-per-page" className="me-2 mb-0">
                Show:
              </Form.Label>
              <Form.Select
                id="items-per-page"
                size="sm"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="items-per-page-select"
                aria-label="Items per page"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
              <span className="ms-2">per page</span>
            </div>
          </Col>
        )}

        {/* Pagination info */}
        {showInfo && totalItems > 0 && (
          <Col xs={12} md className="mb-2 mb-md-0">
            <div className="pagination-info">
              Showing {startItem} to {endItem} of {totalItems} entries
            </div>
          </Col>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <Col xs={12} md="auto">
            <Pagination className="mb-0 justify-content-center justify-content-md-end">
              {/* First page */}
              <Pagination.First
                disabled={currentPage === 1}
                onClick={() => handlePageChange(1)}
                onKeyDown={(e) => handleKeyDown(e, 1)}
                aria-label="Go to first page"
              />

              {/* Previous page */}
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                onKeyDown={(e) => handleKeyDown(e, currentPage - 1)}
                aria-label="Go to previous page"
              />

              {/* Show ellipsis if there are pages before visible range */}
              {visiblePages[0] > 1 && (
                <>
                  <Pagination.Item
                    onClick={() => handlePageChange(1)}
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                  >
                    1
                  </Pagination.Item>
                  {visiblePages[0] > 2 && <Pagination.Ellipsis disabled />}
                </>
              )}

              {/* Visible page numbers */}
              {visiblePages.map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                  onKeyDown={(e) => handleKeyDown(e, page)}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? "page" : undefined}
                >
                  {page}
                </Pagination.Item>
              ))}

              {/* Show ellipsis if there are pages after visible range */}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                    <Pagination.Ellipsis disabled />
                  )}
                  <Pagination.Item
                    onClick={() => handlePageChange(totalPages)}
                    onKeyDown={(e) => handleKeyDown(e, totalPages)}
                  >
                    {totalPages}
                  </Pagination.Item>
                </>
              )}

              {/* Next page */}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                onKeyDown={(e) => handleKeyDown(e, currentPage + 1)}
                aria-label="Go to next page"
              />

              {/* Last page */}
              <Pagination.Last
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(totalPages)}
                onKeyDown={(e) => handleKeyDown(e, totalPages)}
                aria-label="Go to last page"
              />
            </Pagination>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default PaginationComponent;
