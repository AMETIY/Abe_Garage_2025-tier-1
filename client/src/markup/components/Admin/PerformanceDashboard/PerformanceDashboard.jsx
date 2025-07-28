import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  ProgressBar,
  Alert,
  Button,
} from "react-bootstrap";
import { useAuth } from "../../../../Contexts/AuthContext";
import Loader from "../../Loader/Loader";
import {
  FaDatabase,
  FaServer,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSync,
  FaTachometerAlt,
  FaMemory,
  FaNetworkWired,
} from "react-icons/fa";
import "./PerformanceDashboard.css";

/**
 * Performance Dashboard Component
 * Displays real-time performance metrics and system health
 */
const PerformanceDashboard = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { employee } = useAuth();
  const token = employee?.employee_token;

  // Fetch performance data
  const fetchPerformanceData = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch performance data");
      }

      const data = await response.json();
      setPerformanceData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Performance data fetch error:", err);
      setError("Failed to load performance metrics");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    fetchPerformanceData();

    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchPerformanceData, autoRefresh]);

  // Manual refresh
  const handleRefresh = () => {
    fetchPerformanceData();
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "excellent":
      case "good":
        return "success";
      case "fair":
        return "warning";
      case "poor":
      case "critical":
        return "danger";
      default:
        return "secondary";
    }
  };

  // Get performance score
  const getPerformanceScore = () => {
    if (!performanceData) return 0;

    const { database, api, system } = performanceData;
    const scores = [];

    if (database?.averageQueryTime) {
      const dbScore =
        database.averageQueryTime < 50
          ? 100
          : database.averageQueryTime < 100
          ? 80
          : database.averageQueryTime < 200
          ? 60
          : 40;
      scores.push(dbScore);
    }

    if (api?.averageResponseTime) {
      const apiScore =
        api.averageResponseTime < 200
          ? 100
          : api.averageResponseTime < 500
          ? 80
          : api.averageResponseTime < 1000
          ? 60
          : 40;
      scores.push(apiScore);
    }

    if (system?.memoryUsage) {
      const memScore =
        system.memoryUsage < 70
          ? 100
          : system.memoryUsage < 85
          ? 80
          : system.memoryUsage < 95
          ? 60
          : 40;
      scores.push(memScore);
    }

    return scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
  };

  if (isLoading && !performanceData) {
    return <Loader />;
  }

  return (
    <div className="performance-dashboard">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <Row className="align-items-center">
          <Col>
            <h2 className="dashboard-title">
              <FaTachometerAlt className="me-2" />
              Performance Dashboard
            </h2>
            <p className="dashboard-subtitle text-muted">
              Real-time system performance monitoring
            </p>
          </Col>
          <Col xs="auto">
            <div className="dashboard-controls">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <FaSync className={isLoading ? "fa-spin" : ""} />
                Refresh
              </Button>
              <Button
                variant={autoRefresh ? "success" : "outline-success"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="ms-2"
              >
                Auto-refresh
              </Button>
            </div>
          </Col>
        </Row>

        {lastUpdated && (
          <small className="text-muted">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </small>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      )}

      {/* Overall Performance Score */}
      <Card className="mb-4 overall-score-card">
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <h3 className="score-title">Overall Performance Score</h3>
              <div className="score-display">
                <span className="score-value">{getPerformanceScore()}</span>
                <span className="score-max">/100</span>
              </div>
            </Col>
            <Col xs="auto">
              <div className="score-indicator">
                <ProgressBar
                  now={getPerformanceScore()}
                  variant={
                    getPerformanceScore() >= 80
                      ? "success"
                      : getPerformanceScore() >= 60
                      ? "warning"
                      : "danger"
                  }
                  className="score-progress"
                />
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Performance Metrics Grid */}
      <Row className="g-4">
        {/* Database Performance */}
        <Col lg={6} md={12}>
          <Card className="metric-card">
            <Card.Header className="metric-header">
              <FaDatabase className="me-2" />
              Database Performance
            </Card.Header>
            <Card.Body>
              {performanceData?.database ? (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Average Query Time:</span>
                    <Badge bg={getStatusColor(performanceData.database.status)}>
                      {performanceData.database.averageQueryTime}ms
                    </Badge>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Active Connections:</span>
                    <span className="metric-value">
                      {performanceData.database.activeConnections}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Cache Hit Rate:</span>
                    <span className="metric-value">
                      {performanceData.database.cacheHitRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Slow Queries:</span>
                    <span className="metric-value">
                      {performanceData.database.slowQueries}
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">No database metrics available</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* API Performance */}
        <Col lg={6} md={12}>
          <Card className="metric-card">
            <Card.Header className="metric-header">
              <FaServer className="me-2" />
              API Performance
            </Card.Header>
            <Card.Body>
              {performanceData?.api ? (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Average Response Time:</span>
                    <Badge bg={getStatusColor(performanceData.api.status)}>
                      {performanceData.api.averageResponseTime}ms
                    </Badge>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Requests per Minute:</span>
                    <span className="metric-value">
                      {performanceData.api.requestsPerMinute}
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Error Rate:</span>
                    <span className="metric-value">
                      {performanceData.api.errorRate}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Active Endpoints:</span>
                    <span className="metric-value">
                      {performanceData.api.activeEndpoints}
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">No API metrics available</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* System Resources */}
        <Col lg={6} md={12}>
          <Card className="metric-card">
            <Card.Header className="metric-header">
              <FaMemory className="me-2" />
              System Resources
            </Card.Header>
            <Card.Body>
              {performanceData?.system ? (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Memory Usage:</span>
                    <div className="metric-progress">
                      <ProgressBar
                        now={performanceData.system.memoryUsage}
                        variant={
                          performanceData.system.memoryUsage < 70
                            ? "success"
                            : performanceData.system.memoryUsage < 85
                            ? "warning"
                            : "danger"
                        }
                        label={`${performanceData.system.memoryUsage}%`}
                      />
                    </div>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">CPU Usage:</span>
                    <div className="metric-progress">
                      <ProgressBar
                        now={performanceData.system.cpuUsage}
                        variant={
                          performanceData.system.cpuUsage < 70
                            ? "success"
                            : performanceData.system.cpuUsage < 85
                            ? "warning"
                            : "danger"
                        }
                        label={`${performanceData.system.cpuUsage}%`}
                      />
                    </div>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Disk Usage:</span>
                    <div className="metric-progress">
                      <ProgressBar
                        now={performanceData.system.diskUsage}
                        variant={
                          performanceData.system.diskUsage < 70
                            ? "success"
                            : performanceData.system.diskUsage < 85
                            ? "warning"
                            : "danger"
                        }
                        label={`${performanceData.system.diskUsage}%`}
                      />
                    </div>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Uptime:</span>
                    <span className="metric-value">
                      {performanceData.system.uptime}
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">No system metrics available</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Network Performance */}
        <Col lg={6} md={12}>
          <Card className="metric-card">
            <Card.Header className="metric-header">
              <FaNetworkWired className="me-2" />
              Network Performance
            </Card.Header>
            <Card.Body>
              {performanceData?.network ? (
                <>
                  <div className="metric-item">
                    <span className="metric-label">Bandwidth Usage:</span>
                    <span className="metric-value">
                      {performanceData.network.bandwidthUsage} Mbps
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Latency:</span>
                    <Badge
                      bg={
                        performanceData.network.latency < 100
                          ? "success"
                          : performanceData.network.latency < 200
                          ? "warning"
                          : "danger"
                      }
                    >
                      {performanceData.network.latency}ms
                    </Badge>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Packet Loss:</span>
                    <span className="metric-value">
                      {performanceData.network.packetLoss}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-label">Active Connections:</span>
                    <span className="metric-value">
                      {performanceData.network.activeConnections}
                    </span>
                  </div>
                </>
              ) : (
                <div className="no-data">No network metrics available</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Performance Alerts */}
      {performanceData?.alerts && performanceData.alerts.length > 0 && (
        <Card className="mt-4 alerts-card">
          <Card.Header className="alerts-header">
            <FaExclamationTriangle className="me-2" />
            Performance Alerts
          </Card.Header>
          <Card.Body>
            {performanceData.alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={
                  alert.severity === "critical"
                    ? "danger"
                    : alert.severity === "warning"
                    ? "warning"
                    : "info"
                }
                className="mb-2"
              >
                <strong>{alert.title}</strong>
                <br />
                {alert.message}
                {alert.timestamp && (
                  <small className="d-block text-muted mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </small>
                )}
              </Alert>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Performance Recommendations */}
      {performanceData?.recommendations &&
        performanceData.recommendations.length > 0 && (
          <Card className="mt-4 recommendations-card">
            <Card.Header className="recommendations-header">
              <FaChartLine className="me-2" />
              Performance Recommendations
            </Card.Header>
            <Card.Body>
              <ul className="recommendations-list">
                {performanceData.recommendations.map((rec, index) => (
                  <li key={index} className="recommendation-item">
                    <FaCheckCircle className="me-2 text-success" />
                    {rec}
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        )}
    </div>
  );
};

export default PerformanceDashboard;
