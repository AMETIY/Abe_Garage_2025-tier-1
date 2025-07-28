import React from "react";
import { useApp } from "../../../Contexts/AppContext";
import "./NotificationContainer.css";

/**
 * Individual Notification Component
 */
const Notification = ({ notification, onRemove }) => {
  const getNotificationClass = (type) => {
    switch (type) {
      case "success":
        return "notification-success";
      case "error":
        return "notification-error";
      case "warning":
        return "notification-warning";
      case "info":
      default:
        return "notification-info";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return "fas fa-check-circle";
      case "error":
        return "fas fa-exclamation-circle";
      case "warning":
        return "fas fa-exclamation-triangle";
      case "info":
      default:
        return "fas fa-info-circle";
    }
  };

  return (
    <div className={`notification ${getNotificationClass(notification.type)}`}>
      <div className="notification-content">
        <div className="notification-icon">
          <i className={getNotificationIcon(notification.type)}></i>
        </div>
        <div className="notification-message">{notification.message}</div>
        <button
          className="notification-close"
          onClick={() => onRemove(notification.id)}
          aria-label="Close notification"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
    </div>
  );
};

/**
 * Notification Container Component
 * Displays all active notifications
 */
const NotificationContainer = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
