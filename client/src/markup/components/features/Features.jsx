import React from "react";
import speedmeter from "../../../assets/images/custom/Speedometer.jpg";

function Features() {
  return (
    <section className="modern-features-section">
      <div className="auto-container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div className="features-content">
              <div className="section-badge">
                <span>Premium Service</span>
              </div>
              <h2 className="features-title">
                Quality Service And <br />
                <span className="highlight-text">Customer Satisfaction !!</span>
              </h2>
              <div className="features-description">
                We utilize the most recent diagnostic gear to ensure your
                vehicle is fixed or adjusted appropriately and in an opportune
                manner. We are an individual from Professional Auto Service, a
                first class execution network, where free assistance offices
                share shared objectives of being world-class car administration
                focuses.
              </div>
              <div className="features-stats">
                <div className="stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Happy Customers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support Available</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="features-image-container">
              <div className="image-wrapper">
                <img
                  src={speedmeter}
                  alt="Professional Auto Service Dashboard"
                  className="main-image"
                />
                <div className="floating-badge">
                  <i className="fas fa-tools"></i>
                  <span>Expert Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;
