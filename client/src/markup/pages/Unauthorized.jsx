import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';

function Unauthorized() {
  return (
    // <div style={{ backgroundColor: '#08194A', height: '100vh', color: 'white' }}>

      <section className="services-section">
    <div className="auto-container text-center py-5">
      <div className="sec-title style-two">
        <h2 className="text-danger">403  Unauthorized</h2>
        <p className="text-muted">
        You don't have permission to access the page you requested.
        </p>
      </div>
      <div className="mt-4">

        <div>
          <a href="/" className="btn btn-primary">
            Back to home
          </a>
        </div>
      </div>
    </div>
  </section>
    // </div>
  );
}

export default Unauthorized;
