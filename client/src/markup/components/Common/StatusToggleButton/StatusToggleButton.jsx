import React from "react";
import { Button } from "react-bootstrap";
import "./StatusToggleButton.css";

/**
 * StatusToggleButton - A reusable toggle button component for active/inactive status
 *
 * @param {boolean} isActive - Current status (true for active, false for inactive)
 * @param {function} onToggle - Callback function when button is clicked
 * @param {string} activeText - Text to display when status is active
 * @param {string} inactiveText - Text to display when status is inactive
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} size - Button size ('sm', 'lg', or default)
 * @param {string} className - Additional CSS classes
 */
const StatusToggleButton = ({
  isActive,
  onToggle,
  activeText = "Active",
  inactiveText = "Inactive",
  disabled = false,
  size,
  className = "",
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onToggle) {
      onToggle(!isActive);
    }
  };

  const handleKeyDown = (event) => {
    // Handle Enter and Space key presses for accessibility
    if ((event.key === "Enter" || event.key === " ") && !disabled) {
      event.preventDefault();
      handleClick();
    }
  };

  const buttonVariant = isActive ? "success" : "danger";
  const displayText = isActive ? activeText : inactiveText;
  const ariaLabel = `Status: ${displayText}. Click to ${
    isActive ? "deactivate" : "activate"
  }`;

  return (
    <Button
      variant={buttonVariant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`status-toggle-button ${className}`}
      aria-label={ariaLabel}
      role="switch"
      aria-checked={isActive}
      {...props}
    >
      {displayText}
    </Button>
  );
};

export default StatusToggleButton;
