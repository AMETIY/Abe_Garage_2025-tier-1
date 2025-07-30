import React from "react";

function Footer() {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();
  return (
    <footer className="main-footer">
      <div className="upper-box">
        <div className="auto-container">
          <div className="row no-gutters">
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon">
                    <span className="flaticon-pin"></span>
                  </div>
                  <div className="text">
                    1719 10 st, <br /> Calgary, CA 12345
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon">
                    <span className="flaticon-email"></span>
                  </div>
                  <div className="text">
                    Email us : <br />
                    amanuelaraya908@gmail.com
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-info-box col-md-4 col-sm-6 col-xs-12">
              <div className="info-inner">
                <div className="content">
                  <div className="icon">
                    <span className="flaticon-phone"></span>
                  </div>
                  <div className="text">
                    Call us on : <br />
                    <strong><a href="tel:+1 587 707 6257">+1 587 707 6257</a></strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="widgets-section">
        <div className="auto-container">
          <div className="widgets-inner-container">
            <div className="row clearfix">
              <div className="footer-column col-lg-4">
                <div className="widget widget_about">
                  <div className="text">
                    Capitalize on low hanging fruit to identify a ballpark value
                    added activity to beta test. Override the digital divide
                    additional clickthroughs.
                  </div>
                </div>
              </div>
              <div className="footer-column col-lg-4">
                <div className="row">
                  <div className="col-md-6">
                    <div className="widget widget_links">
                      <h4 className="widget_title">Usefull Links</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <a href="index.html">Home</a>
                          </li>
                          <li>
                            <a href="about.html">About Us</a>
                          </li>
                          <li>
                            <a href="#">Appointment</a>
                          </li>
                          <li>
                            <a href="testimonial.html">Testimonials</a>
                          </li>
                          <li>
                            <a href="contact.html">Contact Us</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="widget widget_links">
                      <h4 className="widget_title">Our Services</h4>
                      <div className="widget-content">
                        <ul className="list">
                          <li>
                            <a href="#">Performance Upgrade</a>
                          </li>
                          <li>
                            <a href="#">Transmission Service</a>
                          </li>
                          <li>
                            <a href="#">Break Repair & Service</a>
                          </li>
                          <li>
                            <a href="#">Engine Service & Repair</a>
                          </li>
                          <li>
                            <a href="#">Tyre & Wheels</a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="footer-column col-lg-4">
                <div className="widget widget_newsletter">
                  <h4 className="widget_title">Newsletter</h4>
                  <div className="text">Get latest updates and offers.</div>
                  <div className="newsletter-form"></div>
                  <ul className="social-links">
                    <li>
                      <a href="https://github.com/AMETIY" target="_blank">
                        <span className="fab fa-github"></span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://www.linkedin.com/in/amanuel-wubneh-816606309/"
                        target="_blank"
                      >
                        <span className="fab fa-linkedin-in"></span>
                      </a>
                    </li>
                    <li>
                      <a href="https://amanuelwubneh.com/" target="_blank">
                        <span className="fas fa-globe"></span>
                      </a>
                    </li>
                    <li>
                      <a href="mailto:amanuelaraya908@gmail.com">
                        <span className="fas fa-envelope"></span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="auto-container">
        <div className="footer-bottom">
          <div className="copyright-text">
            © Copyright <a href="#">Abe Garage</a> {currentYear}. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
