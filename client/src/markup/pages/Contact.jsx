import React from "react";
import BannerService from "../components/BannerService/BannerService";
import banner1 from "../../assets/images/custom/banner/banner1.jpg";
import Schedule from "../components/features/Schedule";

const Contact = () => {
  return (
    <>
      <BannerService page="Contact Us" bg={banner1} />
      <section className="contact-section">
        <div className="auto-container">
          <div className="contact-title"></div>

          {/* Contact Row */}
          <div className="row clearfix">
            {/* Google Map Section */}
            <section className="map-section col-lg-7">
              <div className="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2508.0!2d-114.0719!3d51.0447!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537170039f843fd5%3A0x266d3bb1b652b63a!2sCalgary%2C%20AB%2C%20Canada!5e0!3m2!1sen!2sca!4v1577214205224!5m2!1sen!2sca"
                  width="800"
                  height="500"
                  style={{ border: 0, width: "100%" }}
                  allowFullScreen
                />
              </div>
            </section>

            {/* Info Section */}
            <div className="info-column col-lg-5">
              <div className="inner-column">
                <h4>Our Address</h4>
                <div className="text">
                  Completely synergize resource taxing relationships via premier
                  niche markets. Professionally cultivate one-to-one customer
                  service.
                </div>
                <ul>
                  <li>
                    <i className="flaticon-pin"></i>
                    <span>Address:</span> 1719 10 st Calgary, CA 12345
                  </li>
                  <li>
                    <i className="flaticon-email"></i>
                    <span>Email:</span> amanuelaraya908@gmail.com
                  </li>
                  <li>
                    <i className="flaticon-phone"></i>
                    <span>Phone:</span> +1 587 707 6257
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Schedule />
    </>
  );
};

export default Contact;
