import React from "react";
import carImage from "../../../assets/images/custom/why.jpg";

function WhyChooseUs() {
  return (
    <section className="modern-why-choose-us">
      <div className="auto-container">
        <div className="row">
          <div className="col-lg-6">
            <div className="why-choose-content">
              <div className="section-badge">
                <span>Why Choose Us</span>
              </div>
              <h2 className="section-title">
                Your Trusted <br />
                <span className="highlight-text">Auto Service Partner</span>
              </h2>
              <div className="section-description">
                Bring to the table win-win survival strategies to ensure
                proactive domination. At the end of the day, going forward, a
                new normal that has evolved from generation heading towards
                excellence.
              </div>

              <div className="features-grid">
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-user-cog"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Certified Expert Mechanics</h4>
                    <p>
                      Professional certified technicians with years of
                      experience
                    </p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-wrench"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Fast And Quality Service</h4>
                    <p>Quick turnaround without compromising on quality</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-tag"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Best Prices in Town</h4>
                    <p>Competitive pricing with transparent cost breakdown</p>
                  </div>
                </div>

                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-trophy"></i>
                  </div>
                  <div className="feature-content">
                    <h4>Awarded Workshop</h4>
                    <p>Industry recognized excellence in automotive service</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="services-content">
              <div className="section-badge">
                <span>Our Services</span>
              </div>
              <h2 className="section-title">
                <span className="highlight-text">Additional Services</span>
              </h2>

              <div className="services-layout">
                <div className="services-image">
                  <img
                    src={carImage}
                    alt="Professional Auto Service"
                    className="service-img"
                  />
                  <div className="image-overlay">
                    <div className="overlay-content">
                      <i className="fas fa-car"></i>
                      <span>Professional Service</span>
                    </div>
                  </div>
                </div>

                <div className="services-list">
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>General Auto Repair & Maintenance</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Transmission Repair & Replacement</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Tire Repair and Replacement</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>State Emissions Inspection</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Brake Job / Brake Services</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Electrical Diagnostics</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Fuel System Repairs</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Starting and Charging Repair</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Steering and Suspension Work</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Emission Repair Facility</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Wheel Alignment</span>
                  </div>
                  <div className="service-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Computer Diagnostic Testing</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseUs;
