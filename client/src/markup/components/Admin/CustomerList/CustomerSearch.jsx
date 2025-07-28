import React, { useState, useEffect, useCallback } from "react";
import { Form, InputGroup } from "react-bootstrap";
import { FaSearch, FaTimes } from "react-icons/fa";
import "./CustomerSearch.css";

/**
 * CustomerSearch - Search component for filtering customers
 *
 * @param {string} searchTerm - Current search term
 * @param {function} onSearchChange - Callback when search term changes
 * @param {string} placeholder - Placeholder text for search input
 * @param {number} debounceDelay - Delay in ms for debouncing search input
 */
const CustomerSearch = ({
  searchTerm = "",
  onSearchChange,
  placeholder = "Search customers by name, email, or phone...",
  debounceDelay = 300,
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearchTerm !== searchTerm) {
        onSearchChange(localSearchTerm);
      }
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [localSearchTerm, debounceDelay, onSearchChange, searchTerm]);

  // Update local state when external searchTerm changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleInputChange = useCallback((e) => {
    setLocalSearchTerm(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setLocalSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
  }, [onSearchChange]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleClearSearch();
      }
    },
    [handleClearSearch]
  );

  return (
    <div className="customer-search mb-3">
      <Form.Group>
        <Form.Label htmlFor="customer-search" className="visually-hidden">
          Search Customers
        </Form.Label>
        <div className="search-input-container">
          <InputGroup className="search-input-group">
            <InputGroup.Text className="search-icon">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              id="customer-search"
              type="text"
              placeholder={placeholder}
              value={localSearchTerm}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              aria-label="Search customers"
              className="search-input"
            />
            {localSearchTerm && (
              <InputGroup.Text
                as="button"
                type="button"
                className="btn btn-outline-secondary border-start-0 clear-button"
                onClick={handleClearSearch}
                title="Clear search"
                aria-label="Clear search"
              >
                <FaTimes />
              </InputGroup.Text>
            )}
          </InputGroup>
          {localSearchTerm && (
            <Form.Text className="text-muted mt-2 search-feedback">
              Searching for "{localSearchTerm}"...
            </Form.Text>
          )}
        </div>
      </Form.Group>
    </div>
  );
};

export default CustomerSearch;
